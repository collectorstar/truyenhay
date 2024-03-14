using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace API.Controllers
{
    public class DashboardController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public DashboardController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<ComicNewestDto>>> GetListComicNewest([FromQuery] GetNewestComicParam dto)
        {
            var list = from x in _uow.ComicRepository.GetAll().Where(x => x.Status == true).OrderByDescending(x => x.UpdateTime ?? x.CreationTime)
                                select new ComicNewestDto
                                {
                                    Id = x.Id,
                                    ComicName = x.Name,
                                    IsFeatured = x.IsFeatured,
                                    MainImage = x.MainImage,
                                    Rate = x.Rate,
                                    NOFollows = _uow.ComicFollowRepository.GetAll().Where(y => y.ComicFollowedId == x.Id).Count(),
                                    NOReviews = x.NOReviews,
                                    Chapters = (from y in _uow.ChapterRepository.GetAll().Where(z => z.ComicId == x.Id && z.Status == true).OrderByDescending(x => x.Id).Take(3)
                                                select new ChapterForComicNewestDto
                                                {
                                                    Name = y.Name,
                                                    UpdateTime = y.UpdateTime ?? y.CreationTime
                                                }).ToList(),
                                };

            var result = await PagedList<ComicNewestDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }
    }
}