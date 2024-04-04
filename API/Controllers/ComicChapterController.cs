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
    public class ComicChapterController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public ComicChapterController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet]
        public async Task<ActionResult<List<string>>> GetChapterImages([FromQuery] int comicId, [FromQuery] int chapterId)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.ComicId == comic.Id && x.Id == chapterId && x.Status && x.ApprovalStatus == ApprovalStatusChapter.Accept);
            if (chapter == null) return NotFound("not found chapter comic");

            var images = _uow.ChapterPhotoRepository.GetAll().Where(x => x.ChapterId == chapter.Id).OrderBy(x => x.Rank).Select(x => x.Url).ToList();

            return Ok(images);

        }

        [HttpGet("comic-info")]
        public async Task<ActionResult<ComicInfoForComicChapterDto>> GetComicInfo([FromQuery] int comicId, [FromQuery] string email)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == email);
            var comicFollow = user != null ? await _uow.ComicFollowRepository.GetAll().FirstOrDefaultAsync(x => x.ComicFollowedId == comic.Id && x.UserFollowedId == user.Id) : null;
            var isFollow = false;
            if (comicFollow != null) isFollow = true;

            return new ComicInfoForComicChapterDto()
            {
                Id = comic.Id,
                Name = comic.Name,
                IsFollow = isFollow
            };
        }

        [HttpGet("chapter-info")]
        public async Task<ActionResult<ChapterInfoForComicChapterDto>> GetChapterInfo([FromQuery] int comicId, [FromQuery] int chapterId, [FromQuery] string email)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.ComicId == comic.Id && x.Id == chapterId && x.Status && x.ApprovalStatus == ApprovalStatusChapter.Accept);
            if (chapter == null) return NotFound("not found chapter comic");

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == email);

            return new ChapterInfoForComicChapterDto()
            {
                Id = chapter.Id,
                Name = chapter.Name,
                UpdateTime = chapter.UpdateTime ?? chapter.CreationTime,
                IsReaded = user != null ? _uow.ChapterHasReadedRepository.GetAll().FirstOrDefault(x => x.UserId == user.Id && x.ChapterId == chapter.Id) != null ? true : false : false,
            };
        }

        [HttpGet("list-chapter-comic")]
        public async Task<ActionResult<List<ChapterInfoForComicChapterDto>>> GetListChapterComic([FromQuery] int comicId, [FromQuery] string email)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == email);

            var result = (from x in _uow.ChapterRepository.GetAll().Where(y => y.ComicId == comic.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept)
                          orderby x.Rank descending
                          select new ChapterInfoForComicChapterDto
                          {
                              Id = x.Id,
                              Name = x.Name,
                              UpdateTime = x.UpdateTime ?? x.CreationTime,
                              IsReaded = user != null ? _uow.ChapterHasReadedRepository.GetAll().FirstOrDefault(y => y.UserId == user.Id && y.ChapterId == x.Id) != null ? true : false : false,
                          }).ToList();

            return Ok(result);
        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("set-has-read-chapter")]
        public async Task<ActionResult> SetHasReadChapter([FromQuery] int comicId, [FromQuery] int chapterId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("not found user");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == chapterId && x.Status && x.ComicId == comic.Id && x.ApprovalStatus == ApprovalStatusChapter.Accept);
            if (chapter == null) return NotFound("not found chapter");


            ChapterHasReaded mark = new ChapterHasReaded()
            {
                UserId = user.Id,
                ChapterId = chapter.Id,
                DatetimeRead = DateTime.Now,
                ComicId = comic.Id
            };

            await _uow.ChapterHasReadedRepository.Add(mark);

            if (!await _uow.Complete()) return BadRequest("fail to mark has been readed this chapter!");

            return Ok();
        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("follow-comic/{comicId}")]
        public async Task<ActionResult> FollowComic(int comicId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("you need login");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var check = await _uow.ComicFollowRepository.GetAll().FirstOrDefaultAsync(x => x.ComicFollowedId == comic.Id && x.UserFollowedId == user.Id);
            if (check != null) return BadRequest("You are already follow comic");

            var comicFollow = new ComicFollow()
            {
                ComicFollowedId = comic.Id,
                UserFollowedId = user.Id,
                CreationTime = DateTime.Now
            };

            await _uow.ComicFollowRepository.Add(comicFollow);

            if (!await _uow.Complete()) return BadRequest("fail to follow comic");

            return Ok();
        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("unfollow-comic/{comicId}")]
        public async Task<ActionResult> UnfollowComic(int comicId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("you need login");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var comicFollow = await _uow.ComicFollowRepository.GetAll().FirstOrDefaultAsync(x => x.ComicFollowedId == comic.Id && x.UserFollowedId == user.Id);
            if (comicFollow == null) return BadRequest("You are already unfollow comic");

            _uow.ComicFollowRepository.Delete(comicFollow);

            if (!await _uow.Complete()) return BadRequest("fail to unfollow comic");

            return Ok();
        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("report-error-chapter")]
        public async Task<ActionResult> GetReportError(ReportErrorChapterDto dto)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.ComicId && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("Not found comic");

            var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.ChapterId && x.ComicId == comic.Id && x.Status && x.ApprovalStatus == ApprovalStatusChapter.Accept);
            if (chapter == null) return NotFound("Not found comic");

            ReportErrorChapter newReport = new ReportErrorChapter()
            {
                UserId = User.GetUserId(),
                ChapterId = chapter.Id,
                ComicId = comic.Id,
                CreationTime = DateTime.Now,
                ErrorCode = dto.ErrorCode,
                Desc = dto.Desc
            };

            await _uow.ReportErrorChapterRepository.Add(newReport);
            if (!await _uow.Complete()) return BadRequest("Fail to report!");
            return Ok();
        }
    }
}