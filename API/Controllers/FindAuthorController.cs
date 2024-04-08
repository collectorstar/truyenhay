using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class FindAuthorController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public FindAuthorController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<ComicForFindAuthorDto>>> GetAll([FromQuery] GetFindAuthorParam dto)
        {
            if (string.IsNullOrWhiteSpace(dto.AuthorName)) return NotFound();
            var list = from x in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept && x.AuthorName.Contains(dto.AuthorName)).OrderByDescending(x => x.UpdateTime ?? x.CreationTime)
                       select new ComicForFindAuthorDto
                       {
                           Id = x.Id,
                           ComicName = x.Name,
                           MainImage = x.MainImage,
                           NOViews = _uow.ChapterHasReadedRepository.GetAll().Where(z => z.ComicId == x.Id).Count(),
                           NOFollows = _uow.ComicFollowRepository.GetAll().Where(y => y.ComicFollowedId == x.Id).Count(),
                           NOComments = _uow.CommentRepository.GetAll().Where(z => z.ComicId == x.Id).Count(),
                           Chapters = (from y in _uow.ChapterRepository.GetAll().Where(z => z.ComicId == x.Id && z.Status && z.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).Take(3)
                                       select new ChapterForFindAuthorDto
                                       {
                                           Id = y.Id,
                                           Name = y.Name,
                                           UpdateTime = y.UpdateTime ?? y.CreationTime,
                                       }).ToList(),
                       };

            var result = await PagedList<ComicForFindAuthorDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            if (!result.Any()) return NotFound();
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

    }
}