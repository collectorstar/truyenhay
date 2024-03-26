namespace API.Helpers
{
    public class ComicHotParams : PaginationParams
    {
        public string ComicName { get; set; }
        public bool IsOnlyHotComic { get; set; }
    }
}