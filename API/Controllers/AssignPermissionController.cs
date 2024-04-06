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
    [Authorize(Policy = "RequireSuperAdminRole")]
    public class AssignPermissionController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;
        private readonly IHubContext<PresenceHub> _presenceHub;

        public AssignPermissionController(UserManager<AppUser> userManager, IUnitOfWork uow, IHubContext<PresenceHub> presenceHub)
        {
            _userManager = userManager;
            _uow = uow;
            _presenceHub = presenceHub;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<GetUserForAssignPermistionDto>>> GetAll([FromQuery] UserForAssignPermistionParam dto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized();

            var list = from x in _userManager.Users.Include(x => x.UserRoles).ThenInclude(x => x.Role).Where(x => (string.IsNullOrWhiteSpace(dto.Email) || x.Email.Contains(dto.Email)) && (dto.OnlyAdmin && x.UserRoles.Any(x => x.Role.Name == "Admin") || !dto.OnlyAdmin) && !x.UserRoles.Any(x => x.Role.Name == "SuperAdmin")).OrderByDescending(x => x.CreationTime)
                       orderby x.CreationTime descending
                       select new GetUserForAssignPermistionDto
                       {
                           Id = x.Id,
                           Email = x.Email,
                           CreationTime = x.CreationTime,
                           IsAdmin = x.UserRoles.Any(x => x.Role.Name == "Admin")
                       };
            var result = await PagedList<GetUserForAssignPermistionDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpPost("add-admin-role")]
        public async Task<ActionResult> AddAdminRole([FromBody] int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null) return BadRequest("Not found user");

            var result = await _userManager.AddToRoleAsync(user, "Admin");
            if (result.Errors.Any())
            {
                return BadRequest("Fail to add role");
            }

            var connectionIds = await PresenceTracker.GetConnectionsForUser(user.Id.ToString());

            if (connectionIds != null) await _presenceHub.Clients.Clients(connectionIds).SendAsync("ChangeRole");

            return Ok();
        }

        [HttpPost("remove-admin-role")]
        public async Task<ActionResult> RemoveAdminRole([FromBody] int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null) return BadRequest("Not found user");

            var result = await _userManager.RemoveFromRoleAsync(user, "Admin");
            if (result.Errors.Any())
            {
                return BadRequest("Fail to remove role");
            }

            var connectionIds = await PresenceTracker.GetConnectionsForUser(user.Id.ToString());

            if (connectionIds != null) await _presenceHub.Clients.Clients(connectionIds).SendAsync("ChangeRole");

            return Ok();
        }
    }
}