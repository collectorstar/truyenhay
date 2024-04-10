namespace API.Dtos
{
    public class ChapterForChapterManagerDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime UpdateTime { get; set; }
        public string ComicName { get; set; }
        public int ComicId { get; set; }
    }
}