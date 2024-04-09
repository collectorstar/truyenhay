using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using API.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize(Policy = "RequireAdminRole")]
    public class UserManagerController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;
        private readonly IHubContext<PresenceHub> _presenceHub;

        public UserManagerController(UserManager<AppUser> userManager, IUnitOfWork uow, IHubContext<PresenceHub> presenceHub)
        {
            _userManager = userManager;
            _uow = uow;
            _presenceHub = presenceHub;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<GetUserForUserManagerDto>>> GetAll([FromQuery] UserForUserManagerParam dto)
        {
            var FromDate = new DateTime();
            var ToDate = new DateTime();

            if (!DateTime.TryParse(dto.FromDate, out FromDate)) return BadRequest("Invalid Fromdate");
            if (!DateTime.TryParse(dto.ToDate, out ToDate)) return BadRequest("Invalid Todate");


            var user = await _userManager.Users.Include(x => x.UserRoles).ThenInclude(x => x.Role).FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized();
            var isSuperAdmin = user.UserRoles.Any(x => x.Role.Name == "SuperAdmin");
            var list = from x in _userManager.Users.Include(x => x.UserRoles).ThenInclude(x => x.Role).Where(x => (string.IsNullOrWhiteSpace(dto.Email) || x.Email.Contains(dto.Email)) && (!dto.OnlyAuthor || x.IsAuthor) && (dto.AllUser || (x.CreationTime.Date >= FromDate.Date && x.CreationTime.Date <= ToDate.Date)) && x.Id != user.Id)
                       where isSuperAdmin || !x.UserRoles.Any(r => r.Role.Name == "Admin")
                       orderby x.CreationTime descending
                       select new GetUserForUserManagerDto
                       {
                           Id = x.Id,
                           CreationTime = x.CreationTime,
                           Email = x.Email,
                           IsAuthor = x.IsAuthor,
                           MaxComic = x.MaxComic,
                           IsBlock = x.IsBlock
                       };

            var result = await PagedList<GetUserForUserManagerDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpPost("block")]
        public async Task<ActionResult> BlockUser([FromBody] int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized();
            var userTarget = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (userTarget == null) return BadRequest("not found user");

            userTarget.IsBlock = true;

            if (!await _uow.Complete())
            {
                return BadRequest("Fail to block");
            }

            var connectionIds = await PresenceTracker.GetConnectionsForUser(userTarget.Id.ToString());

            if (connectionIds != null) await _presenceHub.Clients.Clients(connectionIds).SendAsync("BlockUser");

            return Ok();

        }

        [HttpPost("unblock")]
        public async Task<ActionResult> UnBlockUser([FromBody] int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized();
            var userTarget = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsBlock);
            if (userTarget == null) return BadRequest("not found user");
            userTarget.IsBlock = false;
            if (!await _uow.Complete())
            {
                return BadRequest("Fail to unblock");
            }

            return Ok();
        }

        [Authorize(Policy = "RequireSuperAdminRole")]
        [HttpPost("inc-max-comic")]
        public async Task<ActionResult> IncMaxComic([FromBody] int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized();
            var userTarget = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (userTarget == null) return BadRequest("not found user");
            userTarget.MaxComic += 1;
            if (!await _uow.Complete())
            {
                return BadRequest("Fail to Inc Max Comic");
            }

            return Ok();
        }

        [Authorize(Policy = "RequireSuperAdminRole")]
        [HttpPost("change-to-author")]
        public async Task<ActionResult> ChangeToAuthor([FromBody] int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized();
            var userTarget = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsAuthor);
            if (userTarget == null) return BadRequest("not found user");
            userTarget.IsAuthor = true;
            userTarget.MaxComic = 1;
            if (!await _uow.Complete())
            {
                return BadRequest("Fail to change to author");
            }

            return Ok();
        }

    }
}