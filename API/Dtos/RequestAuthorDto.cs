using API.Helpers;

namespace API.Dtos
{
    public class RequestAuthorDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Content { get; set; }
        public DateTime CreationTime { get; set; }
        public StatusRequesAuthor Status { get; set; }
    }
}