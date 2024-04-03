using System.Diagnostics;
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
    [Authorize(Policy = "RequireMemberRole")]
    public class NotifyController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public NotifyController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<GetAllNotifyDto>>> GetAll([FromQuery] NotifyParam dto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized();

            var list = from x in _uow.NotityRepository.GetAll().Where(x => x.UserRecvId == user.Id).OrderByDescending(x => x.CreationTime)
                       join y in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept) on x.ComicIdRef equals y.Id into joincomic
                       from y in joincomic.DefaultIfEmpty()
                       join z in _uow.ChapterRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusChapter.Accept) on x.ChapterIdRef equals z.Id into joinchapter
                       from z in joinchapter.DefaultIfEmpty()
                       select new GetAllNotifyDto
                       {
                           Id = x.Id,
                           CreationTime = x.CreationTime,
                           IsReaded = x.IsReaded,
                           Message = x.Message,
                           Image = x.Type == NotifyType.RequestAuthor ? ""
                                : x.Type == NotifyType.ApprovalComic ? y.MainImage
                                : x.Type == NotifyType.ApprovalChapter ? y.MainImage
                                : x.Type == NotifyType.RequestIncMaxComic ? ""
                                : x.Type == NotifyType.FixDoneChapter ? y.MainImage
                                : "",
                           Link = x.Type == NotifyType.RequestAuthor ? "/upload-comic"
                                : x.Type == NotifyType.ApprovalComic ? "/upload-comic"
                                : x.Type == NotifyType.ApprovalChapter ? "/comic-detail/" + y.Name.Replace(" ", "-") + "/" + y.Id + "/" + z.Name.Replace(" ", "-") + "/" + z.Id
                                : x.Type == NotifyType.RequestIncMaxComic ? "/upload-comic"
                                : x.Type == NotifyType.FixDoneChapter ? "/comic-detail/" + y.Name.Replace(" ", "-") + "/" + y.Id + "/" + z.Name.Replace(" ", "-") + "/" + z.Id
                                : "",
                       };

            var result = await PagedList<GetAllNotifyDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpPost("mark-all-readed")]
        public async Task<ActionResult> MarkAllReaded()
        {
            var list = await _uow.NotityRepository.GetAll().Where(x => !x.IsReaded && x.UserRecvId == User.GetUserId()).ToListAsync();
            if (list.Any())
            {
                list.ForEach(x => x.IsReaded = true);
                await _uow.Complete();
            }

            return Ok();
        }

        [HttpPost("mark-readed")]
        public async Task<ActionResult> MarkReaded([FromBody] int notifyId)
        {
            var notify = await _uow.NotityRepository.GetAll().Where(x => x.Id == notifyId).FirstOrDefaultAsync();
            if (notify != null)
            {
                notify.IsReaded = true;
                await _uow.Complete();
            }

            return Ok();
        }

    }
}