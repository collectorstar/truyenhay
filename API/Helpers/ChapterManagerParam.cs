namespace API.Helpers
{
    public class ChapterManagerParam : PaginationParams
    {
        public string ComicName { get; set; }
        public string ChapterName { get; set; }
    }
}