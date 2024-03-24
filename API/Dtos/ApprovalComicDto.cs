using API.Helpers;

namespace API.Dtos
{
    public class ApprovalComicDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreationTime { get; set; }
        public string MainImage { get; set; }
        public string Desc { get; set; }
        public string Genres { get; set; }
        public ApprovalStatusComic ApprovalStatus { get; set; }
        public int AuthorId { get; set; }
    }
}