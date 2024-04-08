namespace API.Dtos
{
    public class ComicForFindAuthorDto
    {
        public int Id { get; set; }
        public string ComicName { get; set; }
        public string MainImage { get; set; }
        public int NOViews { get; set; }
        public int NOFollows { get; set; }
        public int NOComments { get; set; }
        public List<ChapterForFindAuthorDto> Chapters { get; set; }
    }
}