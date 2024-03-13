namespace API.Dtos
{
    public class RecommendComicDto
    {
        public int Id { get; set; }
        public string UrlImage { get; set; }
        public string ComicName { get; set; }
        public string NewestChapter { get; set; }
        public DateTime? UpdateTime { get; set; }
    }
}