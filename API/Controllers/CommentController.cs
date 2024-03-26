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
    public class CommentController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public CommentController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet("get-comments")]
        public async Task<ActionResult<PagedList<CommentDto>>> GetCommentsForComics([FromQuery] GetCommentsParam dto)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.ComicId && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var list = from x in _uow.CommentRepository.GetAll().Where(x => x.ComicId == comic.Id && (dto.ChapterId == -1 || x.ChapterId == dto.ChapterId))
                       join z in _userManager.Users on x.UserSentId equals z.Id
                       join y in _uow.ChapterRepository.GetAll().Where(x => x.ComicId == comic.Id && x.Status && x.ApprovalStatus == ApprovalStatusChapter.Accept)
                       on x.ChapterId equals y.Id into chapterLJ
                       from y in chapterLJ.DefaultIfEmpty()
                       orderby x.CreationTime descending
                       select new CommentDto
                       {
                           Id = x.Id,
                           ChapterId = x.ChapterId,
                           ChapterName = y.Name,
                           Name = x.Name,
                           Content = x.Content,
                           CreationTime = x.CreationTime,
                           PhotoAvatar = z.PhotoUrl,
                           ComicId = comic.Id,
                           ComicName = comic.Name
                       };
            var result = await PagedList<CommentDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);

        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("send-comment")]
        public async Task<ActionResult> SendComment(SendCommentDto dto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("you must login");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept && x.Id == dto.ComicId);
            if (comic == null) return NotFound("not found comic");
            var chapterId = -1;
            if (dto.ChapterId != -1)
            {
                var chapter = await _uow.ChapterRepository.GetAll().FirstOrDefaultAsync(x => x.Status && x.ApprovalStatus == ApprovalStatusChapter.Accept && x.Id == dto.ChapterId);
                if (chapter == null) return NotFound("not found chapter");
                chapterId = chapter.Id;
            }

            Comment cmt = new Comment()
            {
                Name = dto.Name,
                Content = dto.Content,
                CreationTime = DateTime.Now,
                UserSentId = user.Id,
                ComicId = comic.Id,
                ChapterId = chapterId
            };

            await _uow.CommentRepository.Add(cmt);
            if (!await _uow.Complete()) return BadRequest("fail to comment");
            return Ok();

        }
    }
}