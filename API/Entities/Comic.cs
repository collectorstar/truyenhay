using API.Helpers;

namespace API.Entities
{
    public class Comic
    {
        public int Id { get; set; }
        public string AuthorName { get; set; }
        public string Name { get; set; }
        public bool IsFeatured { get; set; }
        public string Desc { get; set; }
        public bool Status { get; set; }
        public bool IsCompleted { get; set; }
        public string MainImage { get; set; }
        public int PhotoComicId {get; set;}
        public int Rate { get; set; }
        public int NOReviews { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? UpdateTime { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsRecommend { get; set; }
        public ApprovalStatusComic ApprovalStatus { get; set; }
        public int AuthorId { get; set; }
    }
}