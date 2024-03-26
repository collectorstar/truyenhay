namespace API.Dtos
{
    public class CommentDto
    {
        public long Id { get; set; }
        public int ChapterId { get; set; }
        public string ChapterName { get; set; }
        public string Name { get; set; }
        public string Content { get; set; }
        public string PhotoAvatar { get; set; }
        public DateTime CreationTime { get; set; }
        public string ComicName { get; set; }
        public int ComicId { get; set; }
    }
}