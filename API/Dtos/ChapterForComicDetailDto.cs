namespace API.Dtos
{
    public class ChapterForComicDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime UpdateTime { get; set; }
        public int View { get; set; }
        public bool HasRead { get; set; }
    }
}
