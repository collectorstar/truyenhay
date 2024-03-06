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
    [Authorize(Policy = "RequireMemberRole")]
    public class ComicController : BaseApiController
    {
        private readonly IUnitOfWork _uow;
        private readonly UserManager<AppUser> _userManager;
        private readonly IPhotoService _photoService;

        public ComicController(IUnitOfWork uow, UserManager<AppUser> userManager, IPhotoService photoService)
        {
            _uow = uow;
            _userManager = userManager;
            _photoService = photoService;
        }

        

    }
}