using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Policy = "RequireMemberRole")]
    public class HistoryController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public HistoryController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<GetComicHistoryDto>>> GetAll([FromQuery] GetComicHistoryParam dto)
        {
            var user = _userManager.Users.FirstOrDefault(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("not found user");

            var history = from x in _uow.ChapterHasReadedRepository.GetAll().Where(x => x.UserId == user.Id).OrderByDescending(x => x.Id)
                          join y in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept) on x.ComicId equals y.Id
                          join z in _uow.ChapterRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusChapter.Accept) on x.ChapterId equals z.Id
                          group new { x }
                          by new
                          {
                              x.ComicId
                          } into grouped
                          select new
                          {
                              grouped.Key.ComicId,
                              grouped.Select(x => x.x).OrderByDescending(x => x.Id).First().ChapterId,
                              grouped.Select(x => x.x).OrderByDescending(x => x.Id).First().Id,
                          };

            var list = from x in history
                       join y in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept)
                       on x.ComicId equals y.Id
                       join z in _uow.ChapterRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusChapter.Accept)
                       on x.ChapterId equals z.Id
                       orderby x.Id descending
                       select new GetComicHistoryDto
                       {
                           Id = y.Id,
                           Name = y.Name,
                           MainImage = y.MainImage,
                           ChapterIdContinue = x.ChapterId,
                           ChapterNameContinue = _uow.ChapterRepository.GetAll().First(k => k.Id == x.ChapterId).Name,
                       };
            var result = await PagedList<GetComicHistoryDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);

        }
    }
}