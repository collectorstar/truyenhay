namespace API.Dtos
{
    public class ComicDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Desc { get; set; }
        public bool IsFeatured { get; set; }
        public string MainImage { get; set; }
        public int Rate { get; set; }
        public int NOReviews { get; set; }
        public int NOFollows { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; }
        public bool IsFollow { get; set; }
        public List<GenreForComicDetailDto> Genres { get; set; }
        public List<ChapterForComicDetailDto> Chapters { get; set; }
    }
}
