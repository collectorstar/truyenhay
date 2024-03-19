using API.Helpers;

namespace API.Dtos
{
    public class ReportErrorChapterDto
    {
        public int ComicId { get; set; }
        public int ChapterId { get; set; }
        public ReportErrorCode ErrorCode { get; set; }
        public string Desc { get; set; }
    }
}