namespace API.Entities
{
    public class ChapterPhoto
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public int ChapterId { get; set; }
    }
}