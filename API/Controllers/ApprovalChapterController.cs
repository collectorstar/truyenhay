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
    [Authorize(Policy = "RequireAdminRole")]
    public class ApprovalChapterController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;
        private readonly IPhotoService _photoService;

        public ApprovalChapterController(UserManager<AppUser> userManager, IUnitOfWork uow, IPhotoService photoService)
        {
            _userManager = userManager;
            _uow = uow;
            _photoService = photoService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<ApprovalChapterDto>>> GetAll([FromQuery] GetAllComicForApprovalChapterParam dto)
        {
            var list = from x in _uow.ChapterRepository.GetAll().Where(x => (string.IsNullOrWhiteSpace(dto.ChapterName) || x.Name.Contains(dto.ChapterName)) && (dto.HideAcceptChapter && x.ApprovalStatus != ApprovalStatusChapter.Accept || !dto.HideAcceptChapter))
                       join y in _uow.ComicRepository.GetAll().Where(x => (string.IsNullOrWhiteSpace(dto.ComicName) || x.Name.Contains(dto.ComicName)) && x.ApprovalStatus == ApprovalStatusComic.Accept) on x.ComicId equals y.Id
                       orderby (y.UpdateTime ?? y.CreationTime) descending
                       select new ApprovalChapterDto
                       {
                           Id = x.Id,
                           Name = x.Name,
                           UpdateTime = x.UpdateTime ?? x.CreationTime,
                           ComicId = y.Id,
                           ComicName = y.Name,
                           ApprovalStatus = x.ApprovalStatus
                       };

            var result = await PagedList<ApprovalChapterDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);

        }

        [HttpPost("accept-chapter")]
        public async Task<ActionResult> AcceptChapter(ApprovalChapterDto dto)
        {
            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id && (x.ApprovalStatus == ApprovalStatusChapter.Waiting || x.ApprovalStatus == ApprovalStatusChapter.Deny));
            if (chapter == null) return BadRequest("not found chapter");

            chapter.ApprovalStatus = ApprovalStatusChapter.Accept;

            if (!await _uow.Complete()) return BadRequest("fail to accept");

            return Ok();
        }

        [HttpPost("deny-chapter")]
        public async Task<ActionResult> DenyChapter(ApprovalChapterDto dto)
        {
            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id && (x.ApprovalStatus == ApprovalStatusChapter.Waiting));
            if (chapter == null) return BadRequest("not found chapter");

            chapter.ApprovalStatus = ApprovalStatusChapter.Deny;

            if (!await _uow.Complete()) return BadRequest("Fail to Deny");

            return Ok();
        }

        [HttpPost("delete-chapter")]
        public async Task<ActionResult> DeleteChapter(ApprovalChapterDto dto)
        {
            await _uow.BeginTransactionAsync();
            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id);
            if (chapter == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("Not found chapter");
            }

            var chapterPhotos = _uow.ChapterPhotoRepository.GetAll().Where(x => x.ChapterId == chapter.Id).ToList();
            if (!chapterPhotos.Any())
            {
                _uow.RollbackTransaction();
                return BadRequest("Bad Data");
            }

            var imagesOld = new List<string>();

            imagesOld = chapterPhotos.Select(x => x.PublicId).ToList();

            #region delete chapterPhoto
            _uow.ChapterPhotoRepository.DeleteRange(chapterPhotos);

            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("Fail to delete chapter photo");
            }
            #endregion

            _uow.ChapterRepository.Delete(chapter);
            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("Fail to delete chapter");
            }

            var chapterHasreads = await _uow.ChapterHasReadedRepository.GetAll().Where(x => x.ChapterId == chapter.Id).ToListAsync();
            if (chapterHasreads.Any())
            {
                _uow.ChapterHasReadedRepository.DeleteRange(chapterHasreads);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to delete chapter has read");
                }
            }

            var chapterReports = await _uow.ReportErrorChapterRepository.GetAll().Where(x => x.ChapterId == chapter.Id).ToListAsync();
            if (chapterReports.Any())
            {
                _uow.ReportErrorChapterRepository.DeleteRange(chapterReports);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to delete chapter report error");
                }
            }

            for (var i = 0; i < imagesOld.Count; i += 100)
            {
                var batch = imagesOld.Skip(i).Take(100).ToList();
                var resultDelete = await _photoService.DeleteListPhotoAsync(batch);
            }

            _uow.CommitTransaction();
            return Ok();
        }

        [HttpGet("get-info-chapter")]
        public async Task<ActionResult<List<string>>> GetInfoChapter(int comicId, int chapterId)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId);
            if (comic == null)
            {
                return BadRequest("fail to find comic");
            }

            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.ComicId == comic.Id && x.Id == chapterId);
            if (chapter == null)
            {
                return BadRequest("fail to find chapter");
            }

            var photoImages = await _uow.ChapterPhotoRepository.GetAll().Where(x => x.ChapterId == chapter.Id).Select(x => x.Url).ToListAsync();
            if (!photoImages.Any())
            {
                return BadRequest("bad data");
            }

            return Ok(photoImages);
        }
    }
}