using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Data;
using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly ISendEmailService _emailService;
        private readonly IConfiguration _config;
        private readonly IPhotoService _photoService;
        private readonly IUnitOfWork _uow;

        public AccountController(UserManager<AppUser> userManager, ITokenService tokenService, ISendEmailService emailService, IConfiguration config, IPhotoService photoService, IUnitOfWork uow)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _emailService = emailService;
            _config = config;
            _photoService = photoService;
            _uow = uow;
        }

        [HttpPost("callback-user")]
        public async Task<ActionResult<UserDto>> RevalidateUser([FromForm] string token)
        {
            var tokenParams = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetSection("TokenKey").Value)),
                ValidateIssuer = false,
                ValidateAudience = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenClaimsPrincipal = tokenHandler.ValidateToken(token, tokenParams, out var validatedToken);
            var userId = 0;
            try
            {
                userId = int.Parse(tokenClaimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            }
            catch (Exception)
            {
                return Unauthorized("Please login again");
            }

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null) return Unauthorized("Please login again");

            return new UserDto
            {
                Email = user.Email,
                Name = user.Name,
                Token = token,
                PhotoUrl = user.PhotoUrl,
                IsAuthor = user.IsAuthor
            };

        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
        {
            if (await UserExists(dto.Email)) return BadRequest("Email is taken");

            var user = new AppUser()
            {
                Name = dto.Name,
                Email = dto.Email,
                UserName = dto.Email
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded) return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "Member");

            return new UserDto
            {
                Email = user.Email,
                Name = user.Name,
                Token = await _tokenService.CreateToken(user),
                PhotoUrl = user.PhotoUrl,
                IsAuthor = user.IsAuthor
            };

        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == loginDto.Email);

            if (user == null) return Unauthorized("Invalid Email");

            var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);

            if (!result) return Unauthorized("Invalid Password");

            return new UserDto
            {
                Token = await _tokenService.CreateToken(user),
                PhotoUrl = user.PhotoUrl,
                Name = user.Name,
                Email = user.Email,
                IsAuthor = user.IsAuthor,
            };
        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("update-info")]
        public async Task<ActionResult> UpdateInfo(UpdateInfoAccountDto dto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("Not Found User");

            user.Name = dto.NewName;

            var request = await _userManager.UpdateAsync(user);

            if (!request.Succeeded) return BadRequest("Upload Info Fail");

            return Ok(new { message = "Update Success!" });
        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("upload-avatar")]
        public async Task<ActionResult> UpdateAvatar(IFormFile image)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());
            if (user == null) return Unauthorized("Not found User");

            if (image == null || image.Length == 0)
            {
                return BadRequest("No image file uploaded");
            }

            if (user.PhotoAvatarId != null)
            {
                var findAvatar = await _uow.PhotoAvatarRepository.GetAll().FirstOrDefaultAsync(x => x.UserId == user.Id);
                if (findAvatar == null) return BadRequest("Fail to find old Avatar");
                var dropResult = await _photoService.DeletePhotoAsync(findAvatar.PublicId);
                if (dropResult.Error != null) return BadRequest("Fail to drop old Avatar");
                _uow.PhotoAvatarRepository.DeletePhotoAvatar(findAvatar);
                user.PhotoAvatarId = null;
                user.PhotoUrl = "";
            }

            var result = await _photoService.UploadAvatar(image);

            if (result.Error != null) return BadRequest(result.Error.Message);

            var photoAvatar = new PhotoAvatar
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
                UserId = user.Id
            };

            await _uow.PhotoAvatarRepository.Add(photoAvatar);

            if (!await _uow.Complete()) return BadRequest("Add photo fail");

            user.PhotoUrl = photoAvatar.Url;
            user.PhotoAvatarId = photoAvatar.Id;

            if (await _uow.Complete()) return Ok(new { url = photoAvatar.Url });

            return BadRequest("Something wrongs");
        }

        [Authorize(Policy = "RequireMemberRole")]
        [HttpPost("change-password")]
        public async Task<ActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == User.GetUserId());

            if (user == null) return Unauthorized("Not Found User");

            var checkpass = await _userManager.CheckPasswordAsync(user, dto.OldPass);
            if (!checkpass) return Unauthorized("Invalid Old Password");

            var result = await _userManager.ChangePasswordAsync(user, dto.OldPass, dto.NewPass);
            if (!result.Succeeded) return BadRequest("Something wrongs");

            return Ok(new { message = "Change password success!" });
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult> ForgotPassword([FromQuery] string email)
        {
            var check = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == email);
            if (check == null) return BadRequest("Invalid Email");

            var token = Convert.ToBase64String(Encoding.UTF8.GetBytes(await _userManager.GeneratePasswordResetTokenAsync(check)));

            string linkSend = _config.GetSection("LinkFontend").Value ?? "";

            if (linkSend == "") return BadRequest("this feature is suspended");

            var mailContent = new MailContent();
            mailContent.To = email;
            mailContent.Subject = "truyenhay reset password";
            mailContent.Body = $@"
                <h1 style='font-family: sans-serif; font-size: 24px; color: #333; text-align: left;'>Hi {check.Name}, this is your link to change password when you forgot password</h1>
                <a style='
                    font-family: 'Open Sans', sans-serif;
                    font-size: 30px;
                    color: #333;
                    text-align: left;
                    background-color: #007bff;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline;
                    margin: 20px 30px;' 
                href='{linkSend}forgot-pass?token={token}'>Click here to change password!</a>
                <h5 style='font-family: sans-serif; font-size: 16px; color: #666; text-align: left;'>This link will stop working after 5 minutes, please change your password as soon as possible</h5>
                <h6 style='font-family: sans-serif; font-size: 12px; color: #999; text-align: left;'>This is a notification email, please do not respond to this email</h6>
            ";

            var result = await _emailService.SendMail(mailContent);
            if (!result) return BadRequest("Request Email fail");

            var response = new
            {
                success = true,
                message = "Email sent successfully. Please check your inbox in the next few minutes.",
                sentAt = DateTime.UtcNow
            };

            return Ok(new { message = "Request success, please check email!" });
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<UserDto>> ResetPassword([FromQuery] string token, ResetPasswordDto dto)
        {
            var check = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == dto.Email);
            if (check == null) return BadRequest("Invalid Email");

            token = Encoding.UTF8.GetString(Convert.FromBase64String(token));

            var change = await _userManager.ResetPasswordAsync(check, token, dto.NewPassword);

            if (!change.Succeeded) return BadRequest("The request has expired, please try submitting the request forgot  password again");

            return new UserDto
            {
                Email = check.Email,
                Name = check.Name,
                Token = await _tokenService.CreateToken(check),
                PhotoUrl = check.PhotoUrl,
                IsAuthor = check.IsAuthor,
            };
        }

        private async Task<bool> UserExists(string email)
        {
            return await _userManager.Users.AnyAsync(x => x.Email == email.ToLower());
        }

    }
}