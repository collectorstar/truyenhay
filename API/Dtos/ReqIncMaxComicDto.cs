using API.Helpers;

namespace API.Dtos
{
    public class ReqIncMaxComicDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public int Quantity { get; set; }
        public string Request { get; set; }
        public DateTime CreationTime { get; set; }
        public RequestIncMaxComicStatus Status { get; set; }
        public DateTime? ProcessingDate { get; set; }
    }
}