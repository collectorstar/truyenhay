using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class DataContext : IdentityDbContext<AppUser, AppRole, int,
    IdentityUserClaim<int>, AppUserRole, IdentityUserLogin<int>,
    IdentityRoleClaim<int>, IdentityUserToken<int>>
    {
        public DataContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Chapter> Chapters { get; set; }
        public DbSet<ChapterPhoto> ChapterPhotos { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Comic> Comics { get; set; }
        public DbSet<ComicGenre> ComicGenres { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<ComicFollow> ComicFollows { get; set; }
        public DbSet<PhotoAvatar> PhotoAvatars { get; set; }
        public DbSet<RequestAuthor> RequestAuthors { get; set; }
        public DbSet<PhotoComic> PhotoComics { get; set; }
        public DbSet<RatingComic> RatingComics { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ComicFollow>()
                .HasKey(k => new { k.UserFollowedId, k.ComicFollowedId });

            builder.Entity<ComicGenre>()
                .HasKey(k => new { k.GenreId, k.ComicId });

            builder.Entity<AppRole>()
                .HasMany(a => a.UserRoles)
                .WithOne(b => b.Role)
                .HasForeignKey(b => b.RoleId)
                .IsRequired();

            builder.Entity<AppUser>()
                .HasMany(a => a.UserRoles)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .IsRequired();

            builder.Entity<AppUser>()
                .HasIndex(u => u.Email)
                .IsUnique();

            #region Not recommended
            // builder.Entity<AppUser>()
            //     .HasMany(a => a.CommentsSent)
            //     .WithOne(b => b.UserSent)
            //     .HasForeignKey(b => b.UserSentId)
            //     .OnDelete(DeleteBehavior.SetNull);

            // builder.Entity<AppUser>()
            //     .HasMany(a => a.ComicsCreate)
            //     .WithOne(b => b.Author)
            //     .HasForeignKey(b => b.AuthorId)
            //     .OnDelete(DeleteBehavior.SetNull);

            // builder.Entity<AppUser>()
            //     .HasMany(a => a.ComicsFollowed)
            //     .WithOne(b => b.UserFollowed)
            //     .HasForeignKey(b => b.UserFollowedId)
            //     .OnDelete(DeleteBehavior.SetNull);

            // builder.Entity<Comic>()
            //     .HasMany(a => a.Comments)
            //     .WithOne(b => b.Comic)
            //     .HasForeignKey(b => b.ComicId)
            //     .OnDelete(DeleteBehavior.SetNull);

            // builder.Entity<Comic>()
            //     .HasMany(a => a.ComicFollows)
            //     .WithOne(b => b.ComicFollowed)
            //     .HasForeignKey(b => b.ComicFollowedId)
            //     .OnDelete(DeleteBehavior.SetNull);

            // builder.Entity<Comic>()
            //     .HasMany(a => a.ComicGenres)
            //     .WithOne(b => b.Comic)
            //     .HasForeignKey(b => b.ComicId)
            //     .OnDelete(DeleteBehavior.SetNull);

            // builder.Entity<Genre>()
            //     .HasMany(a => a.ComicGenres)
            //     .WithOne(b => b.Genre)
            //     .HasForeignKey(b => b.GenreId)
            //     .OnDelete(DeleteBehavior.SetNull);

            // builder.Entity<Comic>()
            //     .HasMany(a => a.Chapters)
            //     .WithOne(b => b.Comic)
            //     .HasForeignKey(b => b.ComicId)
            //     .OnDelete(DeleteBehavior.SetNull);

            // builder.Entity<Chapter>()
            //     .HasMany(a => a.ChapterPhotos)
            //     .WithOne(b => b.Chapter)
            //     .HasForeignKey(b => b.ChapterId)
            //     .OnDelete(DeleteBehavior.SetNull);
            #endregion
        }

    }
}