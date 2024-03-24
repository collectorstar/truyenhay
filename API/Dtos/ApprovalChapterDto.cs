using API.Helpers;

namespace API.Dtos
{
    public class ApprovalChapterDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime UpdateTime { get; set; }
        public int ComicId { get; set; }
        public string ComicName { get; set; }
        public ApprovalStatusChapter ApprovalStatus { get; set; }
    }
}