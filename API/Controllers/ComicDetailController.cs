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
    public class ComicDetailController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public ComicDetailController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [HttpGet]
        public async Task<ActionResult<ComicDetailDto>> GetDetailComic([FromQuery] int comicId, [FromQuery] string email)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("Comic is not found or blocked");

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == email);
            var comicFollow = user != null ? await _uow.ComicFollowRepository.GetAll().FirstOrDefaultAsync(x => x.ComicFollowedId == comic.Id && x.UserFollowedId == user.Id) : null;
            var isFollow = false;
            if (comicFollow != null) isFollow = true;

            var result = new ComicDetailDto()
            {
                Id = comic.Id,
                Name = comic.Name,
                IsFeatured = comic.IsFeatured,
                Desc = comic.Desc,
                MainImage = comic.MainImage,
                Rate = comic.Rate,
                NOReviews = comic.NOReviews,
                NOFollows = _uow.ComicFollowRepository.GetAll().Where(x => x.ComicFollowedId == comic.Id).Count(),
                AuthorId = comic.AuthorId,
                AuthorName = _userManager.Users.First(x => x.Id == comic.AuthorId).Name,
                IsFollow = isFollow,
                Genres = (from y in _uow.ComicGenreRepository.GetAll().Where(y => y.ComicId == comic.Id)
                          join z in _uow.GenreRepository.GetAll().Where(x => x.Status == true) on y.GenreId equals z.Id
                          select new GenreForComicDetailDto
                          {
                              Id = z.Id,
                              Name = z.Name
                          }).ToList(),
                Chapters = (from x in _uow.ChapterRepository.GetAll().Where(x => x.ComicId == comic.Id && x.Status && x.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id)
                            select new ChapterForComicDetailDto
                            {
                                Id = x.Id,
                                Name = x.Name,
                                UpdateTime = x.UpdateTime ?? x.CreationTime,
                                HasRead = user != null ? _uow.ChapterHasReadedRepository.GetAll().Any(z => z.UserId == user.Id && z.ChapterId == x.Id) : false,
                                View = _uow.ChapterHasReadedRepository.GetAll().Where(z => z.ChapterId == x.Id).Count(),

                            }).ToList(),
            };

            return Ok(result);
        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("rating/{comicId}")]
        public async Task<ActionResult> RatingComic(int comicId, [FromBody] int rate)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var ratingComics = _uow.RatingComicRepository.GetAll().Where(x => x.ComicId == comic.Id).ToList();

            var myRating = ratingComics.Where(x => x.Userid == User.GetUserId());
            if (myRating.Count() >= 5) return BadRequest("You have rated this comic too much");

            var ratingComic = new RatingComic()
            {
                Userid = User.GetUserId(),
                ComicId = comic.Id,
                Rating = rate
            };

            await _uow.RatingComicRepository.Add(ratingComic);
            comic.Rate = (int)Math.Floor((decimal)((ratingComics.Sum(x => x.Rating) + ratingComic.Rating) / (ratingComics.Count() + 1)));
            comic.NOReviews += 1;
            if (!await _uow.Complete()) return BadRequest("fail to rating");
            return Ok(new { message = "Thank for your rating" });
        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("follow-comic/{comicId}")]
        public async Task<ActionResult> FollowComic(int comicId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("you need login");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var check = await _uow.ComicFollowRepository.GetAll().FirstOrDefaultAsync(x => x.ComicFollowedId == comic.Id && x.UserFollowedId == user.Id);
            if (check != null) return BadRequest("You are already follow comic");

            var comicFollow = new ComicFollow()
            {
                ComicFollowedId = comic.Id,
                UserFollowedId = user.Id,
                CreationTime = DateTime.Now
            };

            await _uow.ComicFollowRepository.Add(comicFollow);

            if (!await _uow.Complete()) return BadRequest("fail to follow comic");

            return Ok();
        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("unfollow-comic/{comicId}")]
        public async Task<ActionResult> UnfollowComic(int comicId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("you need login");

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == comicId && x.ApprovalStatus == ApprovalStatusComic.Accept);
            if (comic == null) return NotFound("not found comic");

            var comicFollow = await _uow.ComicFollowRepository.GetAll().FirstOrDefaultAsync(x => x.ComicFollowedId == comic.Id && x.UserFollowedId == user.Id);
            if (comicFollow == null) return BadRequest("You are already unfollow comic");

            _uow.ComicFollowRepository.Delete(comicFollow);

            if (!await _uow.Complete()) return BadRequest("fail to unfollow comic");

            return Ok();
        }
    }
}