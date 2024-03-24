namespace API.Helpers
{
    public class GetAllComicForApprovalComicParam : PaginationParams
    {
        public string Name { get; set; }
        public bool HideAcceptComic { get; set; }
    }
}