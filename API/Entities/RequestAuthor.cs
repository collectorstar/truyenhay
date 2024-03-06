namespace API.Entities
{
    public class RequestAuthor
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Content { get; set; }
        public DateTime CreationTime { get; set; } = DateTime.Now;
        public bool Status { get; set; }
        public int UserId { get; set; }
    }
}