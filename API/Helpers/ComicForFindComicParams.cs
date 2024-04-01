namespace API.Helpers
{
    public class ComicForFindComicParams : PaginationParams
    {
        public int StatusComic { get; set; }
        public string GenresSeleted { get; set; }
        public string ComicName { get; set; }
    }
}