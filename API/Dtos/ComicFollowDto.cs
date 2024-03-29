namespace API.Dtos
{
    public class ComicFollowDto
    {
        public int Id { get; set; }
        public string ComicName { get; set; }
        public string MainImage { get; set; }
        public int Rate { get; set; }
        public int NOReviews { get; set; }
        public int ChapterIdContinue { get; set; }
        public string ChapterNameContinue { get; set; }
        public List<ChapterForComicFollowDto> Chapters { get; set; }
    }
}