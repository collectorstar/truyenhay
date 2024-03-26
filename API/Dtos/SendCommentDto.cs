namespace API.Dtos
{
    public class SendCommentDto
    {
        public int ComicId { get; set; }
        public int ChapterId { get; set; }
        public string Name { get; set; }
        public string Content { get; set; }
    }
}