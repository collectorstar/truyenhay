namespace API.Dtos
{
    public class GetUserForUserManagerDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public bool IsAuthor { get; set; }
        public DateTime CreationTime { get; set; }
        public int MaxComic { get; set; }
        public bool IsBlock { get; set; }
    }
}