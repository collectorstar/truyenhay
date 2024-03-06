namespace API.Dtos
{
    public class UserDto
    {
        public string Name { get; set; }
        public string Token { get; set; }
        public string PhotoUrl { get; set; }
        public string Email { get; set; }
        public bool IsAuthor { get; set; }
    }
}