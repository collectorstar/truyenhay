using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace API.Controllers
{
    public class FindComicController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public FindComicController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet("get-genres")]
        public async Task<ActionResult<List<GenreForFindComicDto>>> GetGenres()
        {
            var list = await (from x in _uow.GenreRepository.GetAll().Where(x => x.Status)
                              select new GenreForFindComicDto
                              {
                                  Value = x.Id,
                                  Label = x.Name
                              }).ToListAsync();
            return Ok(list);
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<ComicForFindComicDto>>> GetAll([FromQuery] ComicForFindComicParams dto)
        {
            var now = DateTime.Now;
            var dayFirstMonth = new DateTime(now.Year, now.Month, 1);
            var dayLastMonth = dayFirstMonth.AddMonths(1).AddDays(-1);
            var dayFirstWeek = now.AddDays(-((int)now.DayOfWeek - 1));
            var dayLastWeek = dayFirstWeek.AddDays(6);
            var genres = JsonConvert.DeserializeObject<List<int>>(dto.GenresSeleted);
            var selectGenre = await _uow.GenreRepository.GetAll().Where(x => x.Status && genres.Contains(x.Id)).Select(x => x.Id).ToListAsync();
            var comics = await _uow.ComicGenreRepository.GetAll().Where(y => selectGenre.Contains(y.GenreId)).Select(x => x.ComicId).Distinct().ToListAsync();
            var list = from x in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept && comics.Contains(x.Id) && (string.IsNullOrWhiteSpace(dto.ComicName) || x.Name.Contains(dto.ComicName)) && (dto.StatusComic == 0 || (dto.StatusComic == 1 && x.IsCompleted) || (dto.StatusComic == 2 && !x.IsCompleted)))
                       select new ComicForFindComicDto
                       {
                           Id = x.Id,
                           ComicName = x.Name,
                           IsFeatured = x.IsFeatured,
                           MainImage = x.MainImage,
                           Rate = x.Rate,
                           NOFollows = _uow.ComicFollowRepository.GetAll().Where(y => y.ComicFollowedId == x.Id).Count(),
                           NOReviews = x.NOReviews,
                           NOChapters = _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept).Count(),
                           NOViews = _uow.ChapterHasReadedRepository.GetAll().Where(y => y.ComicId == x.Id && (
                                    dto.SortComic == 0 || dto.SortComic == 4 || dto.SortComic == 5 || dto.SortComic == 6
                                    || (dto.SortComic == 1 && y.DatetimeRead.Date >= dayFirstMonth.Date && y.DatetimeRead.Date <= dayLastMonth.Date)
                                    || (dto.SortComic == 2 && y.DatetimeRead.Date >= dayFirstWeek.Date && y.DatetimeRead <= dayLastWeek.Date)
                                    || (dto.SortComic == 3 && y.DatetimeRead.Date == now.Date)
                                )
                           ).Count(),
                           NOComments = _uow.CommentRepository.GetAll().Where(z => z.ComicId == x.Id).Count(),
                           Chapters = (from y in _uow.ChapterRepository.GetAll().Where(z => z.ComicId == x.Id && z.Status && z.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).Take(3)
                                       select new ChapterForFindComicDto
                                       {
                                           Id = y.Id,
                                           Name = y.Name,
                                           UpdateTime = y.UpdateTime ?? y.CreationTime,
                                       }).ToList(),
                       };

            if (dto.SortComic == 0 || dto.SortComic == 1 || dto.SortComic == 2 || dto.SortComic == 3)
            {
                list = list.OrderByDescending(x => x.NOViews);
            }
            else if (dto.SortComic == 4)
            {
                list = list.OrderByDescending(x => x.NOFollows);
            }
            else if (dto.SortComic == 5)
            {
                list = list.OrderByDescending(x => x.NOComments);
            }
            else
            {
                list = list.OrderByDescending(x => x.NOChapters);
            }

            var result = await PagedList<ComicForFindComicDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

    }
}