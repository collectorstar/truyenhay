using API.Data;
using API.Helpers;
using API.Interfaces;
using API.Repositories;
using API.Services;
using API.SignalR;
using Microsoft.AspNetCore.Identity;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            services.AddCors();
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            services.AddScoped<IGenreRepository, GenreRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<ISendEmailService, SendEmailService>();
            services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));
            services.Configure<MailSettings>(config.GetSection("MailSettings"));
            services.AddScoped<IPhotoService, PhotoService>();
            services.AddScoped<IPhotoAvatarRepository, PhotoAvatarRepository>();
            services.AddScoped<IRequestAuthorRepository, RequestAuthorRepository>();
            services.AddScoped<IComicRepository, ComicRepository>();
            services.AddScoped<IPhotoComicRepository, PhotoComicRepository>();
            services.AddScoped<IChapterRepository, ChapterRepository>();
            services.AddScoped<IChapterPhotoRepository, ChapterPhotoRepository>();
            services.AddScoped<IComicGenreRepository, ComicGenreRepository>();
            services.Configure<DataProtectionTokenProviderOptions>(opt => opt.TokenLifespan = TimeSpan.FromMinutes(5));
            services.AddSignalR();
            services.AddSingleton<PresenceTracker>();
            services.AddScoped<IRatingComicRepository, RatingComicRepository>();
            services.AddScoped<IComicFollowRepository, ComicFollowRepository>();
            services.AddScoped<IChapterHasReadedRepository, ChapterHasReadedRepository>();
            services.AddScoped<IReportErrorChapterRepository, ReportErrorChapterRepository>();
            services.AddScoped<IRequestIncMaxComicRepository, RequestIncMaxComicRepository>();
            services.AddScoped<ICommentRepository, CommentRepository>();
            services.AddScoped<INotityRepository, NotityRepository>();
            return services;
        }
    }
}