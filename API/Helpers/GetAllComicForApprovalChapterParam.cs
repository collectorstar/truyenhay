namespace API.Helpers
{
    public class GetAllComicForApprovalChapterParam : PaginationParams
    {
        public string ComicName { get; set; }
        public string ChapterName { get; set; }
        public bool HideAcceptChapter { get; set; }
    }
}