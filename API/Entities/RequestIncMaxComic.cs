using API.Helpers;

namespace API.Entities
{
    public class RequestIncMaxComic
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Quantity { get; set; }
        public string Request { get; set; }
        public DateTime CreationTime { get; set; }
        public RequestIncMaxComicStatus Status { get; set; }
        public DateTime? ProcessingDate { get; set; }
    }
}