namespace API.Dtos
{
    public class ComicDetailForListChapterDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<ChapterDto> Chapters { get; set; }
    }
}