namespace API.Helpers
{
    public class GetCommentsParam : PaginationParams
    {
        public int ComicId { get; set; }
        public int ChapterId { get; set; }
    }
}