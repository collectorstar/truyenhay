namespace API.Dtos
{
    public class ComicForGenreCusDto
    {
        public int Id { get; set; }
        public string ComicName { get; set; }
        public bool IsFeatured { get; set; }
        public string MainImage { get; set; }
        public int Rate { get; set; }
        public int NOReviews { get; set; }
        public int NOFollows { get; set; }
        public int NOComments { get; set; }
        public List<ChapterForGenreCusDto> Chapters { get; set; }
    }
}