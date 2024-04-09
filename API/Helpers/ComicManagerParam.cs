namespace API.Helpers
{
    public class ComicManagerParam : PaginationParams
    {
        public string Email { get; set; }
        public string ComicName { get; set; }
    }
}