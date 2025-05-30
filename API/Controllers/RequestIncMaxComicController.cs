using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using API.SignalR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class RequestIncMaxComicController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;
        private readonly IHubContext<PresenceHub> _presenceHub;

        public RequestIncMaxComicController(UserManager<AppUser> userManager, IUnitOfWork uow, IHubContext<PresenceHub> presenceHub)
        {
            _userManager = userManager;
            _uow = uow;
            _presenceHub = presenceHub;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<ReqIncMaxComicDto>>> GetAll([FromQuery] GetAllReqIncMacComicParam dto)
        {
            var list = from x in _uow.RequestIncMaxComicRepository.GetAll()
                       join y in _userManager.Users on x.UserId equals y.Id
                       where (string.IsNullOrWhiteSpace(dto.Email) || y.Email.Contains(dto.Email)) && ((dto.IsShowWattingReq && x.Status == RequestIncMaxComicStatus.Waiting) || !dto.IsShowWattingReq)
                       orderby x.Status
                       select new ReqIncMaxComicDto
                       {
                           Id = x.Id,
                           Email = y.Email,
                           Quantity = x.Quantity,
                           Request = x.Request,
                           CreationTime = x.CreationTime,
                           Status = x.Status,
                           ProcessingDate = x.ProcessingDate
                       };
            var result = await PagedList<ReqIncMaxComicDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpPost("accept")]
        public async Task<ActionResult> Accept(ReqIncMaxComicDto dto)
        {
            await _uow.BeginTransactionAsync();
            var req = await _uow.RequestIncMaxComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id);
            if (req == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("not found request");
            }

            req.Status = RequestIncMaxComicStatus.Accept;
            req.ProcessingDate = DateTime.Now;
            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("Fail to Accept request");
            }

            var author = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == req.UserId && x.IsAuthor);
            if (author == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("not found author");
            }

            author.MaxComic += dto.Quantity;
            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("fail to increase");
            }

            var notify = new Notify()
            {
                CreationTime = DateTime.Now,
                UserRecvId = req.UserId,
                Message = "Your request to increase comic max has been accepted",
                Type = NotifyType.RequestIncMaxComic,
                IsReaded = false
            };

            await _uow.NotifyRepository.Add(notify);

            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("Fail to create notify");
            }

            var connectionIds = await PresenceTracker.GetConnectionsForUser(author.Id.ToString());

            if (connectionIds != null) await _presenceHub.Clients.Clients(connectionIds).SendAsync("AcceptReqIncComic", author.MaxComic);

            _uow.CommitTransaction();
            return Ok();
        }

        [HttpPost("deny")]
        public async Task<ActionResult> Deny(ReqIncMaxComicDto dto)
        {
            await _uow.BeginTransactionAsync();
            var req = await _uow.RequestIncMaxComicRepository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id);
            if (req == null)
            {
                _uow.RollbackTransaction();
                return BadRequest("not found request");
            }

            req.Status = RequestIncMaxComicStatus.Deny;
            req.ProcessingDate = DateTime.Now;
            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("Fail to Deny request");
            }

            var notify = new Notify()
            {
                CreationTime = DateTime.Now,
                UserRecvId = req.UserId,
                Message = "Your request to increase comic max has been rejected",
                Type = NotifyType.RequestIncMaxComic,
                IsReaded = false
            };

            await _uow.NotifyRepository.Add(notify);

            if (!await _uow.Complete())
            {
                _uow.RollbackTransaction();
                return BadRequest("Fail to create notify");
            }

            _uow.CommitTransaction();
            return Ok();
        }


    }
}