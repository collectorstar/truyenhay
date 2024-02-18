using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    public class AppUser : IdentityUser<int>
    {
        public string Name { get; set; }
        public bool Gender { get; set; }
        public bool IsAuthor { get; set; }
        public DateTime CreationTime { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; }
        public List<AppUserRole> UserRoles { get; set; }
    }
}