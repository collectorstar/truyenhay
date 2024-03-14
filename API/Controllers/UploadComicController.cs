using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("Not found user");

            if (!user.IsAuthor) return BadRequest("You are not the author");

            List<GenreForUploadComicDto> listGenre = JsonConvert.DeserializeObject<List<GenreForUploadComicDto>>(dto.ListGenre);

            if (dto.Id != null)
            {
                var find = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id);
                if (find == null) return BadRequest("Data not found");
                var check = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id != dto.Id && x.Name == dto.Name);
                if (check != null) return BadRequest("Name is exist");

                find.Name = dto.Name;
                find.Desc = dto.Desc;
                find.Status = dto.Status;
                find.UpdateTime = DateTime.Now;

                if (dto.File != null)
                {
                    var findPhotoComic = await _uow.PhotoComicRepository.GetAll().FirstOrDefaultAsync(x => x.CommicId == find.Id);
                    if (findPhotoComic == null) return BadRequest("Fail to find old Image Comic");

                    var deletePhotoComicOld = await _photoService.DeletePhotoAsync(findPhotoComic.PublicId);

                    if (deletePhotoComicOld.Error != null) return BadRequest(deletePhotoComicOld.Error.Message);

                    find.MainImage = "";
                    find.PhotoComicId = 0;

                    var resultUpload = await _photoService.UploadImageComic(dto.File);

                    if (resultUpload.Error != null) return BadRequest(resultUpload.Error.Message);

                    var photoComicNew = new PhotoComic
                    {
                        Url = resultUpload.SecureUrl.AbsoluteUri,
                        PublicId = resultUpload.PublicId,
                        CommicId = find.Id,
                    };

                    _uow.PhotoComicRepository.Delete(findPhotoComic);

                    await _uow.PhotoComicRepository.Add(photoComicNew);

                    if (!await _uow.Complete()) return BadRequest("Fail to Add new Image");

                    find.PhotoComicId = photoComicNew.Id;
                    find.MainImage = photoComicNew.Url;

                    if (!await _uow.Complete()) return BadRequest("Fail to update image");

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
                    if (!await _uow.Complete()) return BadRequest("Fail remove old Genre");

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
                    if (!await _uow.Complete()) return BadRequest("Fail add new Genre");
                }
                #endregion

                return Ok(new { message = "Update Commic Success" });

            }
            else
            {
                if (dto.File == null || dto.File.Length == 0) return BadRequest("File image is empty");

                var check = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Name == dto.Name);

                if (check != null) return BadRequest("Name is exist");

                var resultUpload = await _photoService.UploadImageComic(dto.File);

                if (resultUpload.Error != null) return BadRequest(resultUpload.Error.Message);

                var photoComicNew = new PhotoComic
                {
                    Url = resultUpload.SecureUrl.AbsoluteUri,
                    PublicId = resultUpload.PublicId,
                };

                await _uow.PhotoComicRepository.Add(photoComicNew);

                if (!await _uow.Complete()) return BadRequest("Fail to add Image Comic");

                var newComic = new Comic
                {
                    Name = dto.Name,
                    Desc = dto.Desc,
                    Status = dto.Status,
                    MainImage = photoComicNew.Url,
                    PhotoComicId = photoComicNew.Id,
                    AuthorId = user.Id,
                    CreationTime = DateTime.Now
                };

                await _uow.ComicRepository.Add(newComic);

                if (!await _uow.Complete()) return BadRequest("Fail to add Comic");

                photoComicNew.CommicId = newComic.Id;

                var listCreateGenreComic = (from x in listGenre
                                            select new ComicGenre
                                            {
                                                CreationTime = DateTime.Now,
                                                GenreId = x.Value,
                                                ComicId = newComic.Id
                                            }).ToList();
                await _uow.ComicGenreRepository.AddRange(listCreateGenreComic);

                if (await _uow.Complete()) return Ok(new { message = "Add Commic Success" });

                return BadRequest("Something Wrongs");

            }
        }


        [HttpDelete]
        public async Task<ActionResult> DeleteComic([FromQuery] int ComicId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("Not found user");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == ComicId && x.AuthorId == user.Id);
            if (comic == null) return NotFound("Not found Comic");

            #region delete chapters
            var chapters = _uow.ChapterRepository.GetAll().Where(x => x.ComicId == comic.Id).ToList();

            if (chapters.Count() > 0)
            {
                var chapterphotos = (from x in chapters
                                     join y in _uow.ChapterPhotoRepository.GetAll() on x.Id equals y.ChapterId
                                     select y).ToList();
                if (chapterphotos.Any())
                {
                    var resultDeleteChapterPhotos = await _photoService.DeleteListPhotoAsync(chapterphotos.Select(x => x.PublicId).ToList());
                    if (resultDeleteChapterPhotos.Error != null) return BadRequest(resultDeleteChapterPhotos.Error.Message);
                    _uow.ChapterPhotoRepository.DeleteRange(chapterphotos);
                    if (!await _uow.Complete()) return BadRequest("Fail to delete images chapter");
                }

                _uow.ChapterRepository.DeleteRange(chapters);
                if (!await _uow.Complete()) return BadRequest("Fail to delete chapters");


            }
            #endregion

            #region delete image comic
            var imageComic = await _uow.PhotoComicRepository.GetAll().FirstOrDefaultAsync(x => x.CommicId == comic.Id);
            if (imageComic == null) return BadRequest("Data Wrongs");

            var resulDeleteMainImageComic = await _photoService.DeletePhotoAsync(imageComic.PublicId);

            if (resulDeleteMainImageComic.Error != null) return BadRequest("Fail to delete image main comic");

            _uow.PhotoComicRepository.Delete(imageComic);

            #endregion

            #region delete comic genres

            var comicGenres = _uow.ComicGenreRepository.GetAll().Where(x => x.ComicId == comic.Id).ToList();

            _uow.ComicGenreRepository.DeleteRange(comicGenres);

            #endregion

            _uow.ComicRepository.Delete(comic);

            if (await _uow.Complete()) return Ok(new { message = "Delete Comic success!" });

            return BadRequest("Something Wrongs");
        }

        [HttpGet("my-comics")]
        public async Task<ActionResult<PagedList<UploadComicDto>>> GetAll([FromQuery] GetAllUploadComicParam dto)
        {
            var list = from x in _uow.ComicRepository.GetAll().Where(x =>x.AuthorId == User.GetUserId() && (string.IsNullOrWhiteSpace(dto.Name) || x.Name.Contains(dto.Name)) ).OrderByDescending(x => x.UpdateTime ?? x.CreationTime)
                       select new UploadComicDto
                       {
                           Id = x.Id,
                           Name = x.Name,
                           IsFeatured = x.IsFeatured,
                           Desc = x.Desc,
                           Status = x.Status,
                           MainImage = x.MainImage,
                           Rate = x.Rate,
                           NOReviews = x.NOReviews,
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

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.AuthorId == user.Id && x.Id == ComicId);
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
                            }).ToList(),
            };

            return Ok(result);
        }

        [HttpPost("create-or-edit-chapter")]
        public async Task<ActionResult> CreateOrEditChapter([FromForm] COEChapterDto dto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("Not found User");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.ComicId && x.AuthorId == User.GetUserId());
            if (comic == null) return BadRequest("Request invalid, please reload again");
            comic.UpdateTime = DateTime.Now;

            if (dto.Id != null)
            {
                var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id);
                if (chapter == null) return NotFound("Can't find this chapter");

                chapter.Name = dto.Name;
                chapter.UpdateTime = DateTime.Now;
                chapter.Status = dto.Status;

                if (!await _uow.Complete()) return BadRequest("No changes happen");

                if (dto.Files != null && dto.Files.Any())
                {
                    foreach (var file in dto.Files)
                    {
                        var rank = 0;
                        if (!int.TryParse(file.FileName.Split('.')[0], out rank)) return BadRequest("Filename is invalid");
                    }

                    #region delete old images
                    var oldChapterPhotos = _uow.ChapterPhotoRepository.GetAll().Where(x => x.ChapterId == chapter.Id).Select(x => x).ToList();
                    if (oldChapterPhotos.Any())
                    {
                        var oldImagePublicIds = oldChapterPhotos.Select(x => x.PublicId).ToList();
                        var resultDeletes = await _photoService.DeleteListPhotoAsync(oldImagePublicIds);
                        if (resultDeletes.Error != null) return BadRequest(resultDeletes.Error.Message);
                        _uow.ChapterPhotoRepository.DeleteRange(oldChapterPhotos);
                        if (!await _uow.Complete()) return BadRequest("Fail to remove old image data");
                    }
                    #endregion

                    #region upload and save image chapter
                    if (dto.Files.Any())
                    {
                        foreach (var file in dto.Files)
                        {
                            var rank = 0;
                            if (!int.TryParse(file.FileName.Split('.')[0], out rank)) return BadRequest("Filename is invalid");
                            var resultUpload = await _photoService.UploadImageChapter(file);
                            if (resultUpload.Error != null) return BadRequest("Fail in upload image process!");

                            var chapterPhoto = new ChapterPhoto()
                            {
                                Url = resultUpload.SecureUrl.AbsoluteUri,
                                PublicId = resultUpload.PublicId,
                                ChapterId = chapter.Id,
                                Rank = rank
                            };

                            await _uow.ChapterPhotoRepository.Add(chapterPhoto);
                            if (!await _uow.Complete()) return BadRequest("Fail to save image photo");
                        }
                    }
                    #endregion

                }

                return Ok(new { message = "Update chapter success!" });

            }
            else
            {
                if (!dto.Files.Any()) return BadRequest("Files empty!");

                var chapter = new Chapter()
                {
                    Name = dto.Name,
                    Status = dto.Status,
                    CreationTime = DateTime.Now,
                    ComicId = comic.Id
                };
                await _uow.ChapterRepository.Add(chapter);

                if (!await _uow.Complete()) return BadRequest("Fail to create chapter");

                #region upload image and save
                foreach (var file in dto.Files)
                {
                    var rank = 0;
                    if (!int.TryParse(file.FileName.Split('.')[0], out rank)) return BadRequest("Filename is invalid");
                    var resultUpload = await _photoService.UploadImageChapter(file);
                    if (resultUpload.Error != null) return BadRequest("Fail in upload image process!");

                    var chapterPhoto = new ChapterPhoto()
                    {
                        Url = resultUpload.SecureUrl.AbsoluteUri,
                        PublicId = resultUpload.PublicId,
                        ChapterId = chapter.Id,
                        Rank = rank
                    };

                    await _uow.ChapterPhotoRepository.Add(chapterPhoto);
                    if (!await _uow.Complete()) return BadRequest("Fail to save image photo");
                }
                #endregion

                return Ok(new { message = "Create Chapter success!" });

            }

        }

        [HttpDelete("delete-chapter/{comicId}")]
        public async Task<ActionResult> DeleteChapter(int comicId, [FromQuery] int ChapterId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("Not found User");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.AuthorId == User.GetUserId());
            if (comic == null) return BadRequest("Request invalid, please reload again");

            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == ChapterId);
            if (chapter == null) return BadRequest("Invalid Chapter");

            var chapterPhotos = await _uow.ChapterPhotoRepository.GetAll().Where(x => x.ChapterId == chapter.Id).ToListAsync();

            if (chapterPhotos.Any())
            {
                var resultDeletePhotos = await _photoService.DeleteListPhotoAsync(chapterPhotos.Select(x => x.PublicId).ToList());
                if (resultDeletePhotos.Error != null) return BadRequest("Fail to delete Image from Source");

                _uow.ChapterPhotoRepository.DeleteRange(chapterPhotos);

                if (!await _uow.Complete()) return BadRequest("Fail to delete image data");
            }

            _uow.ChapterRepository.Delete(chapter);
            comic.UpdateTime = DateTime.Now;
            if (!await _uow.Complete()) return BadRequest("Fail to delete Chapter");

            return Ok(new { message = "Delete chapter success!" });

        }
    }
}