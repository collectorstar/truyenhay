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
    [Authorize(Policy = "RequireAdminRole")]
    public class ApprovalComicController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;
        private readonly IPhotoService _photoService;

        public ApprovalComicController(UserManager<AppUser> userManager, IUnitOfWork uow, IPhotoService photoService)
        {
            _userManager = userManager;
            _uow = uow;
            _photoService = photoService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<ApprovalComicDto>>> GetAll([FromQuery] GetAllComicForApprovalComicParam dto)
        {
            var list = from x in _uow.ComicRepository.GetAll().Where(x => (string.IsNullOrWhiteSpace(dto.Name) || x.Name.Contains(dto.Name)) && (dto.HideAcceptComic && x.ApprovalStatus != ApprovalStatusComic.Accept || !dto.HideAcceptComic))
                       orderby x.ApprovalStatus, x.CreationTime descending
                       select new ApprovalComicDto
                       {
                           Id = x.Id,
                           Name = x.Name,
                           CreationTime = x.CreationTime,
                           AuthorId = x.AuthorId,
                           ApprovalStatus = x.ApprovalStatus,
                           MainImage = x.MainImage,
                           Desc = x.Desc,
                           Genres = string.Join(", ", from y in _uow.ComicGenreRepository.GetAll().Where(y => y.ComicId == x.Id)
                                                      join z in _uow.GenreRepository.GetAll() on y.GenreId equals z.Id
                                                      select z.Name)
                       };

            var result = await PagedList<ApprovalComicDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);

        }

        [HttpPost("accept-comic")]
        public async Task<ActionResult> AcceptComic(ApprovalComicDto dto)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id && (x.ApprovalStatus == ApprovalStatusComic.Waiting || x.ApprovalStatus == ApprovalStatusComic.Deny));
            if (comic == null) return BadRequest("not found comic");

            comic.ApprovalStatus = ApprovalStatusComic.Accept;

            if (!await _uow.Complete()) return BadRequest("fail to accept");

            var notify = new Notify()
            {
                ComicIdRef = comic.Id,
                CreationTime = DateTime.Now,
                UserRecvId = comic.AuthorId,
                Message = "Your comic " + comic.Name + " has been accepted",
                Type = NotifyType.ApprovalComic,
                IsReaded = false
            };

            await _uow.NotifyRepository.Add(notify);

            if (!await _uow.Complete()) return BadRequest("Fail to create notify");

            return Ok();
        }

        [HttpPost("deny-comic")]
        public async Task<ActionResult> DenyComic(ApprovalComicDto dto)
        {
            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id && (x.ApprovalStatus == ApprovalStatusComic.Waiting));
            if (comic == null) return BadRequest("not found comic");

            comic.ApprovalStatus = ApprovalStatusComic.Deny;

            if (!await _uow.Complete()) return BadRequest("Fail to Deny");

            var notify = new Notify()
            {
                ComicIdRef = comic.Id,
                CreationTime = DateTime.Now,
                UserRecvId = comic.AuthorId,
                Message = "Your comic " + comic.Name + " has been rejected",
                Type = NotifyType.ApprovalComic,
                IsReaded = false
            };

            await _uow.NotifyRepository.Add(notify);

            if (!await _uow.Complete()) return BadRequest("Fail to create notify");


            return Ok();
        }

        [HttpPost("delete-comic")]
        public async Task<ActionResult> DeleteComic(ApprovalComicDto dto)
        {
            await _uow.BeginTransactionAsync();
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == dto.AuthorId);
            if (user == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("Not found user");
            }

            var comic = await _uow.ComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id && x.AuthorId == user.Id && x.ApprovalStatus == ApprovalStatusComic.Deny);
            if (comic == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("Not found Comic");
            }

            #region delete notify
            var notifies = await _uow.NotifyRepository.GetAll().Where(x => x.ComicIdRef == comic.Id).ToListAsync();
            if (notifies.Any())
            {
                _uow.NotifyRepository.DeleteRange(notifies);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to delete notify");
                }
            }
            #endregion

            #region delete image comic
            var imageComic = await _uow.PhotoComicRepository.GetAll().FirstOrDefaultAsync(x => x.ComicId == comic.Id);
            if (imageComic == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("Data Wrongs");
            }
            var imageComicPublicId = imageComic.PublicId;

            _uow.PhotoComicRepository.Delete(imageComic);
            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("fail to delete photo comic");
            }
            #endregion

            #region delete comic genres

            var comicGenres = _uow.ComicGenreRepository.GetAll().Where(x => x.ComicId == comic.Id).ToList();
            if (comicGenres.Any())
            {
                _uow.ComicGenreRepository.DeleteRange(comicGenres);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to delete comicgenre");
                }
            }

            #endregion

            _uow.ComicRepository.Delete(comic);

            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("fail to delete comic");
            }

            var resultDeleteChapterPhotos = await _photoService.DeletePhotoAsync(imageComicPublicId);
            if (resultDeleteChapterPhotos.Error != null)
            {
                _uow.RollbackTransaction();
                return BadRequest(resultDeleteChapterPhotos.Error.Message);
            }

            _uow.CommitTransaction();
            return Ok();
        }

        [HttpPost("delete-all-deny")]
        public async Task<ActionResult> DeleteAllDeny(GetAllComicForApprovalComicParam dto)
        {
            await _uow.BeginTransactionAsync();
            var comics = await _uow.ComicRepository.GetAll().Where(x => (string.IsNullOrWhiteSpace(dto.Name) || x.Name.Contains(dto.Name)) && x.ApprovalStatus == ApprovalStatusComic.Deny).ToListAsync();
            if (!comics.Any())
            {
                _uow.CommitTransaction();
                return Ok();
            };


            List<string> photoPublicids = new List<string>();
            #region delete image comic
            var imageComics = (from y in comics
                               join x in _uow.PhotoComicRepository.GetAll() on y.Id equals x.ComicId
                               select x).ToList();
            var imageComicPublicIds = new List<string>();
            if (imageComics.Any())
            {
                imageComicPublicIds = imageComics.Select(x => x.PublicId).ToList();
                _uow.PhotoComicRepository.DeleteRange(imageComics);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to delete photo comic");
                }
            }

            #endregion

            #region delete comic genres

            var comicGenres = (from y in comics
                               join x in _uow.ComicGenreRepository.GetAll() on y.Id equals x.ComicId
                               select x).ToList();
            if (comicGenres.Any())
            {
                _uow.ComicGenreRepository.DeleteRange(comicGenres);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("fail to delete comicgenre");
                }
            }

            #endregion

            #region delete notify
            var notifies = (from x in comics
                            join y in _uow.NotifyRepository.GetAll() on x.Id equals y.ComicIdRef
                            select y).ToList();
            if (notifies.Any())
            {
                _uow.NotifyRepository.DeleteRange(notifies);
                if (!await _uow.Complete())
                {
                    _uow.RollbackTransaction();
                    return BadRequest("Fail to delete notify");
                }
            }
            #endregion

            _uow.ComicRepository.DeleteRange(comics);

            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("fail to delete comic");
            }

            photoPublicids.AddRange(imageComicPublicIds);
            var resultDeleteChapterPhotos = await _photoService.DeleteListPhotoAsync(photoPublicids);
            if (resultDeleteChapterPhotos.Error != null)
            {
                _uow.RollbackTransaction();
                return BadRequest(resultDeleteChapterPhotos.Error.Message);
            }

            _uow.CommitTransaction();
            return Ok();

        }

    }
}