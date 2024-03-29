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
        public async Task<ActionResult<PagedList<ComicFollowDto>>> GetComicsFollow([FromQuery] GetComicFollowParam dto)
        {

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            var chapterContinues = from x in _uow.ChapterHasReadedRepository.GetAll().Where(x => x.UserId == user.Id)
                                   join y in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept) on x.ComicId equals y.Id
                                   join z in _uow.ChapterRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusChapter.Accept) on x.ChapterId equals z.Id
                                   orderby x.Id descending
                                   select x;
            var list = from x in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept).OrderByDescending(x => x.UpdateTime ?? x.CreationTime)
                       join y in _uow.ComicFollowRepository.GetAll().Where(x => x.UserFollowedId == User.GetUserId()) on x.Id equals y.ComicFollowedId
                       select new ComicFollowDto
                       {
                           Id = x.Id,
                           ComicName = x.Name,
                           MainImage = x.MainImage,
                           Rate = x.Rate,
                           NOReviews = x.NOReviews,
                           ChapterIdContinue = chapterContinues.Where(z => z.ComicId == x.Id).Any() ? chapterContinues.First(z => z.ComicId == x.Id).ChapterId : 0,
                           ChapterNameContinue = chapterContinues.Where(z => z.ComicId == x.Id).Any() ? _uow.ChapterRepository.GetAll().First(z => z.Id == chapterContinues.First(k => k.ComicId == x.Id).ChapterId).Name : "",
                           Chapters = (from z in _uow.ChapterRepository.GetAll().Where(z => z.ComicId == x.Id && z.Status && z.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).Take(3)
                                       select new ChapterForComicFollowDto
                                       {
                                           Id = z.Id,
                                           Name = z.Name,
                                           UpdateTime = z.UpdateTime ?? z.CreationTime,
                                           HasRead = _uow.ChapterHasReadedRepository.GetAll().Any(k => k.UserId == user.Id && k.ChapterId == z.Id)
                                       }).ToList(),
                       };

            var result = await PagedList<ComicFollowDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

    }
}