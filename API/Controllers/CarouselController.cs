using API.Dtos;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class CaroselController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;

        public CaroselController(UserManager<AppUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet]
        public async Task<List<RecommendComicDto>> GetAll()
        {
            var result = await (from x in _uow.ComicRepository.GetAll().Where(x => x.IsRecommend && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept)
                                select new RecommendComicDto
                                {
                                    Id = x.Id,
                                    UrlImage = x.MainImage,
                                    ComicName = x.Name,
                                    NewestChapter = _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).Any() ? _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).First().Name : "",
                                    NewestChapterId = _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).Any() ? _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).First().Id : 0,
                                    UpdateTime = _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).FirstOrDefault() != null ? _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).First().UpdateTime ?? _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).First().CreationTime : null
                                }).ToListAsync();
            return result;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost]
        public async Task<ActionResult> Update(List<ComicForIsRecommend> ComicRecommends)
        {
            List<ComicForIsRecommend> comicRecommends = ComicRecommends;

            var oldRecommendComic = (from x in _uow.ComicRepository.GetAll().Where(x => x.IsRecommend == true && x.ApprovalStatus == ApprovalStatusComic.Accept)
                                     select x.Id).ToList();
            var newRecommendComic = (from x in comicRecommends select x.Value).ToList();
            var itemsToRemove = oldRecommendComic.Except(newRecommendComic).ToList();
            if (itemsToRemove.Any())
            {
                var findOld = _uow.ComicRepository.GetAll().Where(x => itemsToRemove.Contains(x.Id) && x.ApprovalStatus == ApprovalStatusComic.Accept).ToList();
                findOld.ForEach(x => x.IsRecommend = false);
                oldRecommendComic.RemoveAll(x => itemsToRemove.Contains(x));
                if (!await _uow.Complete()) return BadRequest("Fail remove old recommend comics");
            }

            var itemsToUpdate = newRecommendComic.Except(oldRecommendComic).ToList();
            if (itemsToUpdate.Any())
            {
                var findNew = _uow.ComicRepository.GetAll().Where(x => itemsToUpdate.Contains(x.Id) && x.ApprovalStatus == ApprovalStatusComic.Accept).ToList();
                findNew.ForEach(x => x.IsRecommend = true);
                if (!await _uow.Complete()) return BadRequest("Fail add new recommend comics");
            }

            return Ok(new { message = "Update success!" });
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("list-comic")]
        public async Task<List<ComicForIsRecommend>> ListComic()
        {
            var result = await (from x in _uow.ComicRepository.GetAll().Where(x => x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept)
                                select new ComicForIsRecommend
                                {
                                    Value = x.Id,
                                    Label = x.Name
                                }).ToListAsync();
            return result;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("list-commic-recommend")]
        public async Task<List<ComicForIsRecommend>> ListCommicRecommend()
        {
            var result = await (from x in _uow.ComicRepository.GetAll().Where(x => x.IsRecommend && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept)
                                select new ComicForIsRecommend
                                {
                                    Value = x.Id,
                                    Label = x.Name
                                }).ToListAsync();
            return result;
        }

        [HttpGet("get-data")]
        public async Task<List<RecommendComicDto>> GetListForCarousel()
        {
            var result = await (from x in _uow.ComicRepository.GetAll().Where(x => x.IsRecommend == true && x.Status && x.ApprovalStatus == ApprovalStatusComic.Accept)
                                select new RecommendComicDto
                                {
                                    Id = x.Id,
                                    UrlImage = x.MainImage,
                                    ComicName = x.Name,
                                    NewestChapter = _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).Any() ? _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).First().Name : "",
                                    NewestChapterId = _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).Any() ? _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).First().Id : 0,
                                    UpdateTime = _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).FirstOrDefault() != null ? _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).First().UpdateTime ?? _uow.ChapterRepository.GetAll().Where(y => y.ComicId == x.Id && y.Status && y.ApprovalStatus == ApprovalStatusChapter.Accept).OrderByDescending(x => x.Id).First().CreationTime : null
                                }).ToListAsync();
            return result;
        }
    }
}