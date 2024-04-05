namespace API.Helpers
{
    public class UserForUserManagerParam : PaginationParams
    {
        public string Email { get; set; }
        public bool AllUser { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public bool OnlyAuthor { get; set; }
    }
}