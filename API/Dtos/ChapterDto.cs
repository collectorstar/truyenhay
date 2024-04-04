using API.Helpers;

namespace API.Dtos
{
    public class ChapterDto
    {
        public int? Id { get; set; }
        public string Name { get; set; }
        public bool Status { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? UpdateTime { get; set; }
        public int View { get; set; }
        public ApprovalStatusChapter ApprovalStatus { get; set; }
        public int Rank { get; set; }
    }
}