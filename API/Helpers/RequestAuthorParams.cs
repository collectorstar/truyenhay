namespace API.Helpers
{
    public class RequestAuthorParams : PaginationParams
    {
        public string Email { get; set; }
        public bool OnlySendRequest { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
    }
}