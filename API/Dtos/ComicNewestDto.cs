namespace API.Dtos
{
    public class ComicNewestDto
    {
        public int Id { get; set; }
        public string ComicName { get; set; }
        public bool IsFeatured { get; set; }
        public string MainImage { get; set; }
        public int Rate { get; set; }
        public int NOReviews { get; set; }
        public int NOViews { get; set; }
        public int NOFollows { get; set; }
        public int NOComments { get; set; }
        public List<ChapterForComicNewestDto> Chapters { get; set; }
    }
}