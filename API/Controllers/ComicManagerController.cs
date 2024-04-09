using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize(Policy = "RequireSuperAdminRole")]
    public class ComicManagerController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;
        private readonly IPhotoService _photoService;

        public ComicManagerController(UserManager<AppUser> userManager, IUnitOfWork uow, IPhotoService photoService)
        {
            _userManager = userManager;
            _uow = uow;
            _photoService = photoService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<ComicForComicManagerDto>>> GetAll([FromQuery] ComicManagerParam dto)
        {
            var list = from x in _userManager.Users.Where(x => x.IsAuthor && (string.IsNullOrWhiteSpace(dto.Email) || x.Email.Contains(dto.Email)))
                       join y in _uow.ComicRepository.GetAll().Where(x => string.IsNullOrWhiteSpace(dto.ComicName) || x.Name.Contains(dto.ComicName)) on x.Id equals y.AuthorId
                       orderby y.UpdateTime ?? y.CreationTime
                       select new ComicForComicManagerDto
                       {
                           Id = y.Id,
                           Name = y.Name,
                           UpdateTime = y.UpdateTime ?? y.CreationTime,
                           Email = x.Email
                       };

            var result = await PagedList<ComicForComicManagerDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpPost("delete-comic")]
        public async Task<ActionResult> DeleteComic([FromBody] int comicId)
        {
            await _uow.BeginTransactionAsync();

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId);
            if (comic == null)
            {
                _uow.RollbackTransaction();
                return NotFound("Not found Comic");
            }

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == comic.AuthorId);
            if (user == null)
            {
                _uow.RollbackTransaction();
                return Unauthorized("Not found user");
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

            #region delete notify
            var notifies = await _uow.NotityRepository.GetAll().Where(x => x.ComicIdRef == comic.Id).ToListAsync();
            if (notifies.Any())
            {
                _uow.NotityRepository.DeleteRange(notifies);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to delete notify");
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

        [HttpPost("transfer-comic")]
        public async Task<ActionResult> TransferComic([FromBody] TransferComicDto dto)
        {
            await _uow.BeginTransactionAsync();
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.ComicId);
            if (comic == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("Not found comic");
            }

            var userTrans = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == dto.Email);
            if (userTrans == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("Not found user");
            }

            var totalComic = await _uow.ComicRepository.GetAll().Where(x => x.Id == userTrans.Id).CountAsync();
            if (totalComic == userTrans.MaxComic)
            {
                _uow.RollbackTransaction();
                return BadRequest("Max comic of userTrans is reached!");
            }

            var notifies = await _uow.NotityRepository.GetAll().Where(x => x.UserRecvId == comic.AuthorId && x.ComicIdRef == comic.Id).ToListAsync();

            if (notifies.Any())
            {
                notifies.ForEach(x => x.UserRecvId = userTrans.Id);
            }

            comic.AuthorId = userTrans.Id;

            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("fail to transfer comic");
            }

            _uow.CommitTransaction();
            return Ok();

        }
    }
}