using API.Helpers;

namespace API.Dtos
{
    public class UploadComicDto
    {
        public int Id { get; set; }
        public string AuthorName { get; set; }
        public string Name { get; set; }
        public bool IsFeatured { get; set; }
        public string Desc { get; set; }
        public bool Status { get; set; }
        public bool IsCompleted { get; set; }
        public string MainImage { get; set; }
        public int Rate { get; set; }
        public int NOReviews { get; set; }
        public int TotalChapter { get; set; }
        public string NewestChapter { get; set; }
        public ApprovalStatusComic ApprovalStatus { get; set; }
        public List<GenreForUploadComicDto> SelectedGenres { get; set; }
    }
}