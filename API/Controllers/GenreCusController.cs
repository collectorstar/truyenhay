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
    public class GenreCusController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public GenreCusController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<ComicForGenreCusDto>>> GetAll([FromQuery] GenreCusParams dto, [FromQuery] string email)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == email);

            var genre = await _uow.GenreRepository.GetAll().Where(x => x.Id == dto.GenreId && x.Status).FirstOrDefaultAsync();
            if (dto.GenreId != 0 && genre == null) return NotFound();
            var listComic = await _uow.ComicGenreRepository.GetAll().Where(x => dto.GenreId == 0 || x.GenreId == genre.Id).Select(x => x.ComicId).Distinct().ToListAsync();

            var list = from x in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept && listComic.Contains(x.Id) && (dto.StatusComic == 0 || (dto.StatusComic == 1 && x.IsCompleted) || (dto.StatusComic == 2 && !x.IsCompleted))).OrderByDescending(x => x.UpdateTime ?? x.CreationTime)
                       select new ComicForGenreCusDto
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
                                       select new ChapterForGenreCusDto
                                       {
                                           Id = y.Id,
                                           Name = y.Name,
                                           UpdateTime = y.UpdateTime ?? y.CreationTime,
                                           HasRead = user != null ? _uow.ChapterHasReadedRepository.GetAll().Any(z => z.UserId == user.Id && z.ChapterId == y.Id) : false
                                       }).ToList(),
                       };

            var result = await PagedList<ComicForGenreCusDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpGet("get-genres")]
        public async Task<ActionResult<List<GenreCusOption>>> GetGenres()
        {
            var list = await (from x in _uow.GenreRepository.GetAll().Where(x => x.Status)
                              select new GenreCusOption
                              {
                                  Value = x.Id,
                                  Label = x.Name,
                                  Desc = x.Desc,
                                  IsFeatured = x.IsFeatured
                              }).ToListAsync();
            return Ok(list);
        }
    }
}