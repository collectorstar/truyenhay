namespace API.Helpers
{
    public class GetAllReqIncMacComicParam : PaginationParams
    {
        public string Email { get; set; }
        public bool IsShowWattingReq { get; set; }
    }
}