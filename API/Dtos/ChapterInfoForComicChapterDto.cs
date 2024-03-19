namespace API.Dtos
{
    public class ChapterInfoForComicChapterDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime UpdateTime { get; set; }
        public bool IsReaded { get; set; }
    }
}