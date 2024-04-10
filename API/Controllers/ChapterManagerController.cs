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
    public class ChapterManagerController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;
        private readonly IPhotoService _photoService;

        public ChapterManagerController(UserManager<AppUser> userManager, IUnitOfWork uow, IPhotoService photoService)
        {
            _userManager = userManager;
            _uow = uow;
            _photoService = photoService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<ChapterForChapterManagerDto>>> GetAll([FromQuery] ChapterManagerParam dto)
        {
            var list = from x in _uow.ComicRepository.GetAll().Where(x => string.IsNullOrWhiteSpace(dto.ComicName) || x.Name.Contains(dto.ComicName))
                       join y in _uow.ChapterRepository.GetAll().Where(x => string.IsNullOrWhiteSpace(dto.ChapterName) || x.Name.Contains(dto.ChapterName)) on x.Id equals y.ComicId
                       orderby x.UpdateTime ?? x.CreationTime descending, y.Rank descending
                       select new ChapterForChapterManagerDto
                       {
                           Id = y.Id,
                           Name = y.Name,
                           UpdateTime = y.UpdateTime ?? y.CreationTime,
                           ComicName = x.Name,
                           ComicId = x.Id
                       };
            var result = await PagedList<ChapterForChapterManagerDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpPost("delete-chapter")]
        public async Task<ActionResult> DeleteChapter([FromBody] int chapterId)
        {
            await _uow.BeginTransactionAsync();

            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == chapterId);
            if (chapter == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("Not found Chapter");
            }

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == chapter.ComicId && x.AuthorId == User.GetUserId() && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("Not found comic");
            }

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

            #region delete notify
            var notifies = await _uow.NotityRepository.GetAll().Where(x => x.ComicIdRef == comic.Id && x.ChapterIdRef == chapter.Id).ToListAsync();
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

            _uow.CommitTransaction();

            for (var i = 0; i < listPhoto.Count; i += 100)
            {
                var batch = listPhoto.Skip(i).Take(100).ToList();
                var resultDelete = await _photoService.DeleteListPhotoAsync(batch);
            }

            return Ok();
        }
    }
}