namespace API.Helpers
{
    public class ReportChapterParam : PaginationParams
    {
        public string ComicName { get; set; }
        public bool IsOnlyInprocessing { get; set; }
    }
}