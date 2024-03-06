namespace API.Dtos
{
    public class ComicDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsFeatured { get; set; }
        public string Desc { get; set; }
        public string MainImage { get; set; }
        public int Rate { get; set; }
        public int NOReviews { get; set; }
        public DateTime CreationTime { get; set; }
        public int AuthorId { get; set; }
        public List<ChapterDto> Chapters { get; set; }
    }
}