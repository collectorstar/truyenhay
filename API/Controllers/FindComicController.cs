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
            var genres = JsonConvert.DeserializeObject<List<int>>(dto.GenresSeleted);
            var selectGenre = await _uow.GenreRepository.GetAll().Where(x => x.Status && genres.Contains(x.Id)).Select(x => x.Id).ToListAsync();
            var comics = await _uow.ComicGenreRepository.GetAll().Where(y => selectGenre.Contains(y.GenreId)).Select(x => x.ComicId).Distinct().ToListAsync();
            var list = from x in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept && comics.Contains(x.Id) && (string.IsNullOrWhiteSpace(dto.ComicName) || x.Name.Contains(dto.ComicName)) && (dto.StatusComic == 0 || (dto.StatusComic == 1 && x.IsCompleted) || (dto.StatusComic == 2 && !x.IsCompleted)))
                       orderby x.UpdateTime ?? x.CreationTime descending
                       select new ComicForFindComicDto
                       {
                           Id = x.Id,
                           ComicName = x.Name,
                           IsFeatured = x.IsFeatured,
                           MainImage = x.MainImage,
                           Rate = x.Rate,
                           NOFollows = _uow.ComicFollowRepository.GetAll().Where(y => y.ComicFollowedId == x.Id).Count(),
                           NOReviews = x.NOReviews,
                           NOComments = _uow.CommentRepository.GetAll().Where(z => z.ComicId == x.Id).Count(),
                           Chapters = (from y in _uow.ChapterRepository.GetAll().Where(z => z.ComicId == x.Id && z.Status && z.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).Take(3)
                                       select new ChapterForFindComicDto
                                       {
                                           Id = y.Id,
                                           Name = y.Name,
                                           UpdateTime = y.UpdateTime ?? y.CreationTime,
                                       }).ToList(),
                       };

            var result = await PagedList<ComicForFindComicDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

    }
}