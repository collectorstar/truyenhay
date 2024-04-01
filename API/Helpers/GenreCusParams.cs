namespace API.Helpers
{
    public class GenreCusParams : PaginationParams
    {
        public int GenreId { get; set; }
        public int StatusComic { get; set; }
    }
}