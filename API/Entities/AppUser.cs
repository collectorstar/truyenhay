using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    public class AppUser : IdentityUser<int>
    {
        public string Name { get; set; }
        public bool IsAuthor { get; set; }
        public DateTime CreationTime { get; set; } = DateTime.Now;
        public string PhotoUrl { get; set; }
        public int? PhotoAvatarId { get; set; }
        public int MaxComic { get; set; }
        public bool IsBlock { get; set; }
        public List<AppUserRole> UserRoles { get; set; }
    }
}