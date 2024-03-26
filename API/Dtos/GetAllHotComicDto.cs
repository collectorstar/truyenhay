namespace API.Dtos
{
    public class GetAllHotComicDto
    {
        public int Id { get; set; }
        public string ComicName { get; set; }
        public int TotalChapter { get; set; }
        public DateTime UpdateTime { get; set; }
        public bool IsHot { get; set; }

    }
}