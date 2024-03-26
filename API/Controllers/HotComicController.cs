using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class HotComicController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public HotComicController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<GetAllHotComicDto>>> GetAll([FromQuery] ComicHotParams dto)
        {
            var list = from x in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept && (string.IsNullOrWhiteSpace(dto.ComicName) || x.Name.Contains(dto.ComicName)) && (dto.IsOnlyHotComic && x.IsFeatured || !dto.IsOnlyHotComic))
                       orderby x.IsFeatured descending, x.UpdateTime ?? x.CreationTime descending
                       select new GetAllHotComicDto
                       {
                           Id = x.Id,
                           ComicName = x.Name,
                           TotalChapter = _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id).Count(),
                           UpdateTime = x.UpdateTime ?? x.CreationTime,
                           IsHot = x.IsFeatured
                       };
            var result = await PagedList<GetAllHotComicDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> Update(GetAllHotComicDto dto)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return BadRequest("not found comic");
            comic.IsFeatured = !comic.IsFeatured;
            if (!await _uow.Complete()) return BadRequest("Fail to update hot for comic");
            return Ok();
        }
    }
}