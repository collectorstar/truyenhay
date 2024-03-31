using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit.Encodings;
using Newtonsoft.Json;

namespace API.Controllers
{
    [Authorize(Policy = "RequireMemberRole")]
    public class UploadComicController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;
        private readonly IPhotoService _photoService;

        public UploadComicController(UserManager<AppUser> userManager, IUnitOfWork uow, IPhotoService photoService)
        {
            _userManager = userManager;
            _uow = uow;
            _photoService = photoService;
        }

        [HttpGet("list-genre")]
        public async Task<ActionResult<List<GenreForUploadComicDto>>> GetListGenre()
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("Not found user");

            var result = await (from x in _uow.GenreRepository.GetAll().Where(x => x.Status == true)
                                select new GenreForUploadComicDto
                                {
                                    Value = x.Id,
                                    Label = x.Name
                                }).ToListAsync();

            return Ok(result);

        }

        [HttpPost("request-author")]
        public async Task<ActionResult> RequestAuthor(UploadAuthorDto dto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return NotFound();

            if (user.IsAuthor) return BadRequest("You already an author!");

            var find = await _uow.RequestAuthorRepository.GetRequestToDay(user.Id);
            if (find != null) return BadRequest("You sent today, please wait until tomorrow");

            var request = new RequestAuthor
            {
                Email = user.Email,
                UserId = user.Id,
                Content = dto.Content,
                Status = StatusRequesAuthor.SendRequest,
            };

            await _uow.RequestAuthorRepository.Create(request);

            if (await _uow.Complete()) return Ok(new { message = "Request sent success, please wait for a response email from us" });

            return BadRequest("Something wrongs");

        }

        [HttpPost]
        public async Task<ActionResult> CreateOrEditComic([FromForm] CreateOrEditComicDto dto)
        {
            await _uow.BeginTransactionAsync();
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null)
            {
                _uow.RollbackTransaction();
                return Unauthorized("Not found user");
            }

            if (!user.IsAuthor)
            {
                _uow.RollbackTransaction();
                return BadRequest("You are not the author");
            }

            List<GenreForUploadComicDto> listGenre = JsonConvert.DeserializeObject<List<GenreForUploadComicDto>>(dto.ListGenre);

            if (dto.Id != null)
            {
                var find = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id && x.ApprovalStatus == ApprovalStatusComic.Accept);
                if (find == null)
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Data not found");
                }
                var check = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id != dto.Id && x.Name == dto.Name && x.ApprovalStatus == ApprovalStatusComic.Accept);
                if (check != null)
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Name is exist");
                }

                find.Name = dto.Name;
                find.Desc = dto.Desc;
                find.Status = dto.Status;
                find.IsCompleted = dto.IsCompleted;
                find.AuthorName = dto.AuthorName;
                find.UpdateTime = DateTime.Now;

                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to update comic");
                }

                #region update genrecomic
                var oldGenreComic = (from x in _uow.ComicGenreRepository.GetAll().Where(x => x.ComicId == dto.Id)
                                     select x.GenreId).ToList();
                var newGenreComic = (from x in listGenre select x.Value).ToList();
                var itemsToRemoveGenreComic = oldGenreComic.Except(newGenreComic).ToList();
                if (itemsToRemoveGenreComic.Any())
                {
                    var findOld = _uow.ComicGenreRepository.GetAll().Where(x => itemsToRemoveGenreComic.Contains(x.GenreId) && x.ComicId == dto.Id).ToList();
                    _uow.ComicGenreRepository.DeleteRange(findOld);
                    oldGenreComic.RemoveAll(x => itemsToRemoveGenreComic.Contains(x));
                    if (!await _uow.Complete())
                    {
                        _uow.RollbackTransaction();
                        return BadRequest("Fail remove old Genre");
                    }

                }

                var itemsToAddGenreComic = newGenreComic.Except(oldGenreComic).ToList();
                if (itemsToAddGenreComic.Any())
                {
                    var findNew = (from x in itemsToAddGenreComic
                                   select new ComicGenre
                                   {
                                       CreationTime = DateTime.Now,
                                       ComicId = (int)dto.Id,
                                       GenreId = x
                                   }).ToList();
                    await _uow.ComicGenreRepository.AddRange(findNew);
                    if (!await _uow.Complete())
                    {
                        _uow.RollbackTransaction();
                        return BadRequest("Fail add new Genre");
                    }
                }
                #endregion

                if (dto.File != null)
                {
                    //fin old image comic
                    var findPhotoComic = await _uow.PhotoComicRepository.GetAll().FirstOrDefaultAsync(x => x.ComicId == find.Id);
                    if (findPhotoComic == null)
                    {
                        _uow.RollbackTransaction();
                        return BadRequest("Fail to find old Image Comic");
                    }
                    //save temp old image comic publicid
                    var photoComicPublicId = findPhotoComic.PublicId;

                    //upload new image comic
                    var resultUpload = await _photoService.UploadImageComic(dto.File);

                    if (resultUpload.Error != null)
                    {
                        _uow.RollbackTransaction();
                        return BadRequest(resultUpload.Error.Message);
                    }

                    //create new entity photocomic
                    var photoComicNew = new PhotoComic
                    {
                        Url = resultUpload.SecureUrl.AbsoluteUri,
                        PublicId = resultUpload.PublicId,
                        ComicId = find.Id,
                    };

                    await _uow.PhotoComicRepository.Add(photoComicNew);

                    if (!await _uow.Complete())
                    {
                        await _photoService.DeletePhotoAsync(photoComicNew.PublicId);
                        _uow.RollbackTransaction();
                        return BadRequest("Fail to Add new Image");
                    }

                    _uow.PhotoComicRepository.Delete(findPhotoComic);

                    if (!await _uow.Complete())
                    {
                        await _photoService.DeletePhotoAsync(photoComicNew.PublicId);
                        _uow.RollbackTransaction();
                        return BadRequest("fail to delete photoComic");
                    }

                    //delete old photo comic
                    var deletePhotoComicOld = await _photoService.DeletePhotoAsync(photoComicPublicId);

                    if (deletePhotoComicOld.Error != null)
                    {
                        await _photoService.DeletePhotoAsync(photoComicNew.PublicId);
                        _uow.RollbackTransaction();
                        return BadRequest(deletePhotoComicOld.Error.Message);
                    }

                    find.PhotoComicId = photoComicNew.Id;
                    find.MainImage = photoComicNew.Url;

                    if (!await _uow.Complete()) return BadRequest("Fail to update image");

                }

                _uow.CommitTransaction();
                return Ok(new { message = "Update Commic Success" });

            }
            else
            {
                if (dto.File == null || dto.File.Length == 0)
                {
                    _uow.RollbackTransaction();
                    return BadRequest("File image is empty");
                }

                var check = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Name == dto.Name && x.ApprovalStatus == ApprovalStatusComic.Accept);

                if (check != null)
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Name is exist");
                }

                var resultUpload = await _photoService.UploadImageComic(dto.File);

                if (resultUpload.Error != null)
                {
                    _uow.RollbackTransaction();
                    return BadRequest(resultUpload.Error.Message);
                }

                var photoComicNew = new PhotoComic
                {
                    Url = resultUpload.SecureUrl.AbsoluteUri,
                    PublicId = resultUpload.PublicId,
                };

                await _uow.PhotoComicRepository.Add(photoComicNew);

                if (!await _uow.Complete())
                {
                    await _photoService.DeletePhotoAsync(resultUpload.PublicId);
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to add Image Comic");
                }

                var newComic = new Comic
                {
                    Name = dto.Name,
                    AuthorName = dto.AuthorName,
                    Desc = dto.Desc,
                    Status = dto.Status,
                    IsCompleted = dto.IsCompleted,
                    MainImage = photoComicNew.Url,
                    PhotoComicId = photoComicNew.Id,
                    AuthorId = user.Id,
                    CreationTime = DateTime.Now,
                    ApprovalStatus = ApprovalStatusComic.Waiting
                };

                await _uow.ComicRepository.Add(newComic);

                if (!await _uow.Complete())
                {
                    await _photoService.DeletePhotoAsync(resultUpload.PublicId);
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to add Comic");
                }

                photoComicNew.ComicId = newComic.Id;

                var listCreateGenreComic = (from x in listGenre
                                            select new ComicGenre
                                            {
                                                CreationTime = DateTime.Now,
                                                GenreId = x.Value,
                                                ComicId = newComic.Id
                                            }).ToList();
                await _uow.ComicGenreRepository.AddRange(listCreateGenreComic);

                if (!await _uow.Complete())
                {
                    await _photoService.DeletePhotoAsync(resultUpload.PublicId);
                    _uow.RollbackTransaction();
                    return BadRequest("Add Commic fail");
                }

                _uow.CommitTransaction();
                return Ok(new { message = "Add Commic Success" });
            }
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteComic([FromQuery] int ComicId)
        {
            await _uow.BeginTransactionAsync();
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null)
            {
                _uow.RollbackTransaction();
                return Unauthorized("Not found user");
            }

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == ComicId && x.AuthorId == user.Id && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null)
            {
                _uow.RollbackTransaction();
                return NotFound("Not found Comic");
            }

            #region delete rating comic
            var rates = _uow.RatingComicRepository.GetAll().Where(x => x.ComicId == comic.Id).ToList();
            if (rates.Any())
            {
                _uow.RatingComicRepository.DeleteRange(rates);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to delete ratingcomic");
                }
            }
            #endregion

            #region delete chapters
            var chapters = _uow.ChapterRepository.GetAll().Where(x => x.ComicId == comic.Id).ToList();

            var photoPublicids = new List<string>();

            if (chapters.Any())
            {
                #region delete hasreaded comic
                var hasReadeds = (from y in chapters
                                  join x in _uow.ChapterHasReadedRepository.GetAll() on y.Id equals x.ChapterId
                                  select x).ToList();
                _uow.ChapterHasReadedRepository.DeleteRange(hasReadeds);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to delete chapterhasread");
                }

                #endregion

                #region delete chapter photo comic
                var chapterphotos = (from x in chapters
                                     join y in _uow.ChapterPhotoRepository.GetAll() on x.Id equals y.ChapterId
                                     select y).ToList();

                if (chapterphotos.Any())
                {
                    photoPublicids = chapterphotos.Select(x => x.PublicId).ToList();

                    _uow.ChapterPhotoRepository.DeleteRange(chapterphotos);
                    if (!await _uow.Complete())
                    {
                        _uow.RollbackTransaction();
                        return BadRequest("Fail to delete images chapter");
                    }
                }
                #endregion

                _uow.ChapterRepository.DeleteRange(chapters);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to delete chapters");
                }
            }
            #endregion

            #region delete image comic
            var imageComic = await _uow.PhotoComicRepository.GetAll().FirstOrDefaultAsync(x => x.ComicId == comic.Id);
            if (imageComic == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("Data Wrongs");
            }
            var imageComicPublicId = imageComic.PublicId;

            _uow.PhotoComicRepository.Delete(imageComic);
            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("fail to delete photo comic");
            }
            #endregion

            #region delete comic genres

            var comicGenres = _uow.ComicGenreRepository.GetAll().Where(x => x.ComicId == comic.Id).ToList();
            if (comicGenres.Any())
            {
                _uow.ComicGenreRepository.DeleteRange(comicGenres);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to delete comicgenre");
                }
            }

            #endregion

            #region delete comic follow
            var comicFollows = _uow.ComicFollowRepository.GetAll().Where(x => x.ComicFollowedId == comic.Id).ToList();
            if (comicFollows.Any())
            {
                _uow.ComicFollowRepository.DeleteRange(comicFollows);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to delete comicFollows");
                }
            }
            #endregion

            #region delete report chapter
            var listReportChapter = _uow.ReportErrorChapterRepository.GetAll().Where(x => x.ComicId == comic.Id).ToList();
            if (listReportChapter.Any())
            {
                _uow.ReportErrorChapterRepository.DeleteRange(listReportChapter);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to delete report error");
                }
            }
            #endregion

            #region delete comments
            var comments = _uow.CommentRepository.GetAll().Where(x => x.ComicId == comic.Id).ToList();
            if (comments.Any())
            {
                _uow.CommentRepository.DeleteRange(comments);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to delete comment");
                }
            }
            #endregion
            _uow.ComicRepository.Delete(comic);

            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("fail to delete comic");
            }

            photoPublicids.Add(imageComicPublicId);
            for (var i = 0; i < photoPublicids.Count; i += 100)
            {
                var batch = photoPublicids.Skip(i).Take(100).ToList();
                var resultDelete = await _photoService.DeleteListPhotoAsync(batch);
            }

            _uow.CommitTransaction();
            return Ok(new { message = "Delete Comic success!" });

        }

        [HttpGet("my-comics")]
        public async Task<ActionResult<PagedList<UploadComicDto>>> GetAll([FromQuery] GetAllUploadComicParam dto)
        {
            var list = from x in _uow.ComicRepository.GetAll().Where(x => x.AuthorId == User.GetUserId() && (string.IsNullOrWhiteSpace(dto.Name) || x.Name.Contains(dto.Name))).OrderByDescending(x => x.UpdateTime ?? x.CreationTime)
                       select new UploadComicDto
                       {
                           Id = x.Id,
                           Name = x.Name,
                           AuthorName = x.AuthorName,
                           IsFeatured = x.IsFeatured,
                           Desc = x.Desc,
                           Status = x.Status,
                           IsCompleted = x.IsCompleted,
                           MainImage = x.MainImage,
                           Rate = x.Rate,
                           NOReviews = x.NOReviews,
                           ApprovalStatus = x.ApprovalStatus,
                           NewestChapter = _uow.ChapterRepository.GetAll().Where(z => z.ComicId == x.Id).OrderByDescending(x => x.Id).First().Name ?? "",
                           TotalChapter = _uow.ChapterRepository.GetAll().Where(z => z.ComicId == x.Id).Count(),
                           SelectedGenres = (from y in _uow.ComicGenreRepository.GetAll().Where(y => y.ComicId == x.Id)
                                             join z in _uow.GenreRepository.GetAll().Where(x => x.Status == true) on y.GenreId equals z.Id
                                             select new GenreForUploadComicDto
                                             {
                                                 Value = z.Id,
                                                 Label = z.Name
                                             }).ToList(),
                       };

            var result = await PagedList<UploadComicDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpGet("list-chapter")]
        public async Task<ActionResult<ComicDetailForListChapterDto>> GetListChapter([FromQuery] int ComicId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("Not found User");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.AuthorId == user.Id && x.Id == ComicId && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound();

            var result = new ComicDetailForListChapterDto()
            {
                Id = comic.Id,
                Name = comic.Name,
                Chapters = (from x in _uow.ChapterRepository.GetAll().Where(x => x.ComicId == ComicId)
                            select new ChapterDto
                            {
                                Id = x.Id,
                                Name = x.Name,
                                CreationTime = x.CreationTime,
                                UpdateTime = x.UpdateTime,
                                Status = x.Status,
                                ApprovalStatus = x.ApprovalStatus,
                                View = _uow.ChapterHasReadedRepository.GetAll().Where(z => z.ChapterId == x.Id).Count()
                            }).ToList(),
            };

            return Ok(result);
        }

        [HttpPost("create-or-edit-chapter")]
        public async Task<ActionResult> CreateOrEditChapter([FromForm] COEChapterDto dto)
        {
            await _uow.BeginTransactionAsync();
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null)
            {
                _uow.RollbackTransaction();
                return Unauthorized("Not found User");
            }

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.ComicId && x.AuthorId == User.GetUserId() && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("Request invalid, please reload again");
            }
            comic.UpdateTime = DateTime.Now;

            if (dto.Id != null)
            {
                var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id && x.ApprovalStatus == ApprovalStatusChapter.Accept);
                if (chapter == null)
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Can't find this chapter");
                }

                chapter.Name = dto.Name;
                chapter.UpdateTime = DateTime.Now;
                chapter.Status = dto.Status;

                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("No changes happen");
                }

                if (dto.Files != null && dto.Files.Any())
                {
                    if (dto.Files.Count > 120)
                    {
                        _uow.RollbackTransaction();
                        return BadRequest("Max 120 photos");
                    }
                    foreach (var file in dto.Files)
                    {
                        var rank = 0;
                        if (!int.TryParse(file.FileName.Split('.')[0], out rank))
                        {
                            _uow.RollbackTransaction();
                            return BadRequest("Filename is invalid");
                        }
                    }

                    chapter.ApprovalStatus = ApprovalStatusChapter.Waiting;
                    if (!await _uow.Complete())
                    {
                        _uow.RollbackTransaction();
                        return BadRequest("fail to set approval status");
                    }

                    #region get old images need delete
                    var oldChapterPhotos = _uow.ChapterPhotoRepository.GetAll().Where(x => x.ChapterId == chapter.Id).Select(x => x).ToList();

                    #endregion

                    #region upload and save image chapter, then delete old images
                    var newImageFile = new List<string>();
                    foreach (var file in dto.Files)
                    {
                        var rank = 0;
                        if (!int.TryParse(file.FileName.Split('.')[0], out rank))
                        {
                            _uow.RollbackTransaction();
                            return BadRequest("Filename is invalid");
                        }
                        var resultUpload = await _photoService.UploadImageChapter(file);
                        if (resultUpload.Error != null)
                        {
                            _uow.RollbackTransaction();
                            return BadRequest("Fail in upload image process!");
                        }

                        var chapterPhoto = new ChapterPhoto()
                        {
                            Url = resultUpload.SecureUrl.AbsoluteUri,
                            PublicId = resultUpload.PublicId,
                            ChapterId = chapter.Id,
                            Rank = rank
                        };

                        newImageFile.Add(resultUpload.PublicId);

                        await _uow.ChapterPhotoRepository.Add(chapterPhoto);
                        if (!await _uow.Complete())
                        {
                            for (var i = 0; i < newImageFile.Count; i += 100)
                            {
                                var batch = newImageFile.Skip(i).Take(100).ToList();
                                var resultDelete = await _photoService.DeleteListPhotoAsync(batch);
                            }
                            _uow.RollbackTransaction();
                            return BadRequest("Fail to save image photo");
                        }
                    }

                    if (oldChapterPhotos.Any())
                    {
                        var oldImagePublicIds = oldChapterPhotos.Select(x => x.PublicId).ToList();
                        _uow.ChapterPhotoRepository.DeleteRange(oldChapterPhotos);
                        if (!await _uow.Complete())
                        {
                            for (var i = 0; i < newImageFile.Count; i += 100)
                            {
                                var batch = newImageFile.Skip(i).Take(100).ToList();
                                var resultDelete = await _photoService.DeleteListPhotoAsync(batch);
                            }
                            _uow.RollbackTransaction();
                            return BadRequest("Fail to remove old image data");
                        }
                        for (var i = 0; i < oldImagePublicIds.Count; i += 100)
                        {
                            var batch = oldImagePublicIds.Skip(i).Take(100).ToList();
                            var resultDelete = await _photoService.DeleteListPhotoAsync(batch);
                        }
                    }
                    #endregion

                }

                _uow.CommitTransaction();
                return Ok(new { message = "Update chapter success!" });

            }
            else
            {
                if (!dto.Files.Any())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Files empty!");
                }

                if (dto.Files.Count > 120)
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Max 120 photos");
                }

                var chapter = new Chapter()
                {
                    Name = dto.Name,
                    Status = dto.Status,
                    CreationTime = DateTime.Now,
                    ComicId = comic.Id
                };
                await _uow.ChapterRepository.Add(chapter);

                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to create chapter");
                }

                var listNew = new List<string>();

                #region upload image and save
                foreach (var file in dto.Files)
                {
                    var rank = 0;
                    if (!int.TryParse(file.FileName.Split('.')[0], out rank))
                    {
                        _uow.RollbackTransaction();
                        return BadRequest("Filename is invalid");
                    }
                    var resultUpload = await _photoService.UploadImageChapter(file);
                    if (resultUpload.Error != null)
                    {
                        _uow.RollbackTransaction();
                        return BadRequest("Fail in upload image process!");
                    }

                    listNew.Add(resultUpload.PublicId);

                    var chapterPhoto = new ChapterPhoto()
                    {
                        Url = resultUpload.SecureUrl.AbsoluteUri,
                        PublicId = resultUpload.PublicId,
                        ChapterId = chapter.Id,
                        Rank = rank
                    };

                    await _uow.ChapterPhotoRepository.Add(chapterPhoto);
                    if (!await _uow.Complete())
                    {
                        for (var i = 0; i < listNew.Count; i += 100)
                        {
                            var batch = listNew.Skip(i).Take(100).ToList();
                            var resultDelete = await _photoService.DeleteListPhotoAsync(batch);
                        }
                        _uow.RollbackTransaction();
                        return BadRequest("Fail to save image photo");
                    }
                }
                #endregion
                _uow.CommitTransaction();
                return Ok(new { message = "Create Chapter success!" });

            }

        }

        [HttpDelete("delete-chapter/{comicId}")]
        public async Task<ActionResult> DeleteChapter(int comicId, [FromQuery] int ChapterId)
        {
            await _uow.BeginTransactionAsync();
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("Not found User");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.AuthorId == User.GetUserId() && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return BadRequest("Request invalid, please reload again");

            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == ChapterId);
            if (chapter == null) return BadRequest("Invalid Chapter");

            #region delete hasreaded
            var hasReadeds = _uow.ChapterHasReadedRepository.GetAll().Where(x => x.ChapterId == chapter.Id).ToList();
            if (hasReadeds.Any())
            {
                _uow.ChapterHasReadedRepository.DeleteRange(hasReadeds);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to delete has readed");
                }
            }
            #endregion

            #region  delete comments
            var comments = _uow.CommentRepository.GetAll().Where(x => x.ComicId == comic.Id && x.ChapterId == chapter.Id).ToList();
            if (comments.Any())
            {
                _uow.CommentRepository.DeleteRange(comments);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to delete comments");
                }
            }
            #endregion

            #region delete chapterPhoto
            var chapterPhotos = await _uow.ChapterPhotoRepository.GetAll().Where(x => x.ChapterId == chapter.Id).ToListAsync();
            var listPhoto = new List<string>();
            if (chapterPhotos.Any())
            {
                listPhoto = chapterPhotos.Select(x => x.PublicId).ToList();
                _uow.ChapterPhotoRepository.DeleteRange(chapterPhotos);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to delete image data");
                }
            }

            #endregion

            comic.UpdateTime = DateTime.Now;
            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("fail to update time comic");
            }

            #region delete report error chapter
            var chapterReports = await _uow.ReportErrorChapterRepository.GetAll().Where(x => x.ChapterId == chapter.Id).ToListAsync();
            if (chapterReports.Any())
            {
                _uow.ReportErrorChapterRepository.DeleteRange(chapterReports);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to delete report error chapter");
                }
            }

            #endregion
            _uow.ChapterRepository.Delete(chapter);
            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("Fail to delete chapter");
            }

            for (var i = 0; i < listPhoto.Count; i += 100)
            {
                var batch = listPhoto.Skip(i).Take(100).ToList();
                var resultDelete = await _photoService.DeleteListPhotoAsync(batch);
            }

            return Ok(new { message = "Delete chapter success!" });
        }

        [HttpGet("check-valid-create-comic")]
        public async Task<ActionResult> CheckValidCreateComic()
        {
            var author = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (author == null) return Unauthorized();
            var totalComic = await _uow.ComicRepository.GetAll().Where(x => x.AuthorId == author.Id).CountAsync();
            if (totalComic >= author.MaxComic) return BadRequest("Please request increase max comic create");
            return Ok();
        }

        [HttpGet("get-all-report-chapters")]
        public async Task<ActionResult<PagedList<ReportErrorChapterForAuthorDto>>> GetAllReportChapter([FromQuery] ReportChapterParam dto)
        {
            var list = from x in _uow.ReportErrorChapterRepository.GetAll().Where(rec => (dto.IsOnlyInprocessing && !rec.Status) || !dto.IsOnlyInprocessing)
                       join y in _uow.ComicRepository.GetAll().Where(comic => comic.AuthorId == User.GetUserId() && comic.ApprovalStatus == ApprovalStatusComic.Accept) on x.ComicId equals y.Id
                       join z in _uow.ChapterRepository.GetAll() on new { comicId = y.Id, chapterId = x.ChapterId } equals new { comicId = z.ComicId, chapterId = z.Id }
                       select new ReportErrorChapterForAuthorDto
                       {
                           Id = x.Id,
                           UserId = x.UserId,
                           ComicId = x.ComicId,
                           ComicName = y.Name,
                           ChapterId = x.ChapterId,
                           ChapterName = z.Name,
                           CreationTime = x.CreationTime,
                           ErrorCode = x.ErrorCode,
                           Desc = x.Desc,
                           Status = x.Status,
                       };

            var result = await PagedList<ReportErrorChapterForAuthorDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpPost("mark-done-report-error-chapter")]
        public async Task<ActionResult> MarkDoneReportErrorChapter(ReportErrorChapterForAuthorDto dto)
        {
            var reportChapter = await _uow.ReportErrorChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id);
            if (reportChapter == null) return NotFound("not found report error");

            var listReportChapter = await _uow.ReportErrorChapterRepository.GetAll().Where(x => x.ComicId == dto.ComicId && x.ChapterId == dto.ChapterId && x.Status == false).ToListAsync();
            listReportChapter.ForEach(x => x.Status = true);
            if (!await _uow.Complete()) return BadRequest("fail to mark done this report error!");
            return Ok();
        }

        [HttpPost("request-inc-max-comic")]
        public async Task<ActionResult> RequestIncMaxComicAction(CreateRequestIncMaxComicDto dto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId() && x.IsAuthor);
            if (user == null) return Unauthorized("not found user");

            var check = await _uow.RequestIncMaxComicRepository.GetAll().FirstOrDefaultAsync(x => x.UserId == user.Id && x.Status == RequestIncMaxComicStatus.Waiting);
            if (check != null) return BadRequest("You already has sent");

            RequestIncMaxComic req = new RequestIncMaxComic();
            req.UserId = user.Id;
            req.Quantity = dto.Quantity;
            req.Request = dto.Request;
            req.Status = RequestIncMaxComicStatus.Waiting;
            req.CreationTime = DateTime.Now;

            await _uow.RequestIncMaxComicRepository.Add(req);
            if (!await _uow.Complete()) return BadRequest("fail to send request");

            return Ok();
        }

        [HttpGet("check-valid-req-inc-comic")]
        public async Task<ActionResult> CheckValidReqIncComic()
        {
            var author = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (author == null) return Unauthorized();
            var check = await _uow.RequestIncMaxComicRepository.GetAll().Where(x => x.UserId == author.Id && x.Status == RequestIncMaxComicStatus.Waiting).FirstOrDefaultAsync();
            if (check != null) return BadRequest("You have already sent your request");
            return Ok();
        }

        [HttpGet("check-valid-create-chapter")]
        public async Task<ActionResult> CheckValidCreateChapter([FromQuery] int comicId)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.AuthorId == User.GetUserId() && x.Id == comicId && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");
            var check = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.ComicId == comic.Id && x.ApprovalStatus == ApprovalStatusChapter.Waiting);
            if (check != null) return BadRequest("You has a chapter waiting");

            return Ok();

        }
    }
}