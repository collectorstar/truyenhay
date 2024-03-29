using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    public class FollowController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public FollowController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<ComicFollowDto>>> GetComicsFollow([FromQuery] GetComicFollowParam dto, [FromQuery] string email)
        {

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == email);

            var list = from x in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept).OrderByDescending(x => x.UpdateTime ?? x.CreationTime)
                       join y in _uow.ComicFollowRepository.GetAll().Where(x => x.UserFollowedId == User.GetUserId()) on x.Id equals y.ComicFollowedId
                       select new ComicFollowDto
                       {
                           Id = x.Id,
                           ComicName = x.Name,
                           IsFeatured = x.IsFeatured,
                           MainImage = x.MainImage,
                           Rate = x.Rate,
                           NOReviews = x.NOReviews,
                           Chapters = (from z in _uow.ChapterRepository.GetAll().Where(z => z.ComicId == x.Id && z.Status && z.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).Take(3)
                                       select new ChapterForComicFollowDto
                                       {
                                           Id = z.Id,
                                           Name = z.Name,
                                           UpdateTime = z.UpdateTime ?? z.CreationTime,
                                           HasRead = user != null ? _uow.ChapterHasReadedRepository.GetAll().Any(k => k.UserId == user.Id && k.ChapterId == z.Id) : false
                                       }).ToList(),
                       };

            var result = await PagedList<ComicFollowDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

    }
}