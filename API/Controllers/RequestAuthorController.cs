using API.Data;
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
    public class RequestAuthorController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _uow;
        private readonly ISendEmailService _emailService;
        private readonly IHubContext<PresenceHub> _presenceHub;

        public RequestAuthorController(UserManager<AppUser> userManager, IUnitOfWork uow, ISendEmailService emailService, IHubContext<PresenceHub> presenceHub)
        {
            _userManager = userManager;
            _uow = uow;
            _emailService = emailService;
            _presenceHub = presenceHub;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<RequestAuthorDto>>> GetAll([FromQuery] RequestAuthorParams dto)
        {
            var FromDate = new DateTime();
            var ToDate = new DateTime();

            if (!DateTime.TryParse(dto.FromDate, out FromDate)) return BadRequest("Invalid Fromdate");
            if (!DateTime.TryParse(dto.ToDate, out ToDate)) return BadRequest("Invalid Todate");

            var list = from x in _uow.RequestAuthorRepository.GetAll().Where(x => (string.IsNullOrWhiteSpace(dto.Email) || x.Email.Contains(dto.Email)) && x.CreationTime.Date >= FromDate.Date && x.CreationTime.Date <= ToDate.Date && (!dto.OnlySendRequest || (dto.OnlySendRequest && x.Status == StatusRequesAuthor.SendRequest)))
                       orderby x.CreationTime.Date descending, x.Status
                       select new RequestAuthorDto
                       {
                           Id = x.Id,
                           CreationTime = x.CreationTime,
                           Email = x.Email,
                           Content = x.Content,
                           Status = x.Status
                       };
            var result = await PagedList<RequestAuthorDto>.CreateAsync(list, dto.PageNumber, dto.PageSize);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));
            return Ok(result);
        }

        [HttpPost("deny")]
        public async Task<ActionResult> DenyRequestAction([FromBody] int RequestId)
        {
            var requestAuthor = _uow.RequestAuthorRepository.GetAll().FirstOrDefault(x => x.Id == RequestId);
            if (requestAuthor == null) return NotFound("Can't find request");

            requestAuthor.Status = StatusRequesAuthor.Deny;
            var listRequest = _uow.RequestAuthorRepository.GetAll().Where(x => x.Id != requestAuthor.Id && x.Status != StatusRequesAuthor.Deny && x.UserId == requestAuthor.UserId).ToList();
            foreach (var request in listRequest)
            {
                request.Status = StatusRequesAuthor.Deny;
            }

            var mailContent = new MailContent();
            mailContent.To = requestAuthor.Email;
            mailContent.Subject = "truyenhay reset password";
            mailContent.Body = $@"
            <h3>Hello, I am the manager of tuyenhay</h3>
            <p>I am sending this email to inform you that your request to become an author on {requestAuthor.CreationTime.ToString("dd/MM/yyyy")} has been denied</p>
            <h6>This is an automated email, please do not respond to this email</h6>
            ";

            var result = await _emailService.SendMail(mailContent);

            if (!result) return BadRequest("Request Email fail");

            if (!await _uow.Complete()) return BadRequest("Fail to update data");

            return Ok(new { message = "This request was denied" });

        }

        [HttpPost("accept")]
        public async Task<ActionResult> AcceptRequestAction([FromBody] int RequestId)
        {
            var requestAuthor = _uow.RequestAuthorRepository.GetAll().FirstOrDefault(x => x.Id == RequestId);
            if (requestAuthor == null) return NotFound("Can't find request");

            requestAuthor.Status = StatusRequesAuthor.Accept;

            var listRequest = _uow.RequestAuthorRepository.GetAll().Where(x => x.Id != requestAuthor.Id && x.Status != StatusRequesAuthor.Deny && x.UserId == requestAuthor.UserId).ToList();
            foreach (var request in listRequest)
            {
                request.Status = StatusRequesAuthor.Deny;
            }

            var author = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == requestAuthor.UserId);
            if (author == null) return BadRequest("Not found author");

            author.IsAuthor = true;
            author.MaxComic = 1;

            if (!await _uow.Complete()) return BadRequest("Fail to update data");

            var connectionIds = await PresenceTracker.GetConnectionsForUser(author.Id.ToString());

            if(connectionIds != null) await _presenceHub.Clients.Clients(connectionIds).SendAsync("AcceptAuthor", "You have just been accepted as an author!");

            return Ok(new { message = "This request was accepted" });
        }

        [HttpPost("contact")]
        public async Task<ActionResult> ContactRequestAction([FromBody] int RequestId)
        {
            var requestAuthor = _uow.RequestAuthorRepository.GetAll().FirstOrDefault(x => x.Id == RequestId);
            if (requestAuthor == null) return NotFound("Can't find request");

            requestAuthor.Status = StatusRequesAuthor.Contact;

            var user = _userManager.Users.FirstOrDefault(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("Not found user");

            var listRequest = _uow.RequestAuthorRepository.GetAll().Where(x => x.Id != requestAuthor.Id && x.Status != StatusRequesAuthor.Deny && x.UserId == requestAuthor.UserId).ToList();
            foreach (var request in listRequest)
            {
                request.Status = StatusRequesAuthor.Deny;
            }

            var mailContent = new MailContent();
            mailContent.To = requestAuthor.Email;
            mailContent.Subject = "truyenhay reset password";
            mailContent.Body = $@"
            <h3>Hello, I am the manager of tuyenhay</h3>
            <h3>I am sending you this email to inform you that we have received your request to become an author.</h3>
            <h4>Please send detailed information about yourself, your contact method, your story and your request to email {user.Email} , we will respond as soon as possible.</h4>
            <h5>This is an automated email, please do not respond to this email</h5>
            ";

            var result = await _emailService.SendMail(mailContent);

            if (!result) return BadRequest("Request Email fail");

            if (!await _uow.Complete()) return BadRequest("Fail to update data");

            return Ok(new { message = "This request was contacted" });
        }
    }
}