namespace API.Dtos
{
    public class GetComicHistoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string MainImage { get; set; }
        public int ChapterIdContinue { get; set; }
        public string ChapterNameContinue { get; set; }
    }
}