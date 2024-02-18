namespace API.Entities
{
    public class Comment
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Content { get; set; }
        public DateTime CreationTime { get; set; } = DateTime.Now;

        public int UserSentId { get; set; }
        public int ComicId { get; set; }
    }
}