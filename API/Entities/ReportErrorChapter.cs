using API.Helpers;

namespace API.Entities
{
    public class ReportErrorChapter
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ComicId { get; set; }
        public int ChapterId { get; set; }
        public DateTime CreationTime { get; set; }
        public ReportErrorCode ErrorCode { get; set; }
        public string Desc { get; set; }
        public bool Status { get; set; }
    }
}