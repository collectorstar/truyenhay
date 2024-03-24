using API.Helpers;

namespace API.Entities
{
    public class Chapter
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Status { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? UpdateTime { get; set; }
        public int ComicId { get; set; }
        public ApprovalStatusChapter ApprovalStatus { get; set; }
    }
}