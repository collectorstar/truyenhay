namespace API.Dtos
{
    public class ComicFollowDto
    {
        public int Id { get; set; }
        public string ComicName { get; set; }
        public bool IsFeatured { get; set; }
        public string MainImage { get; set; }
        public int Rate { get; set; }
        public int NOReviews { get; set; }
        public List<ChapterForComicFollowDto> Chapters { get; set; }
    }
}