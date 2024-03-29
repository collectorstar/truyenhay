namespace API.Entities
{
    public class ChapterHasReaded
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ComicId { get; set; }
        public int ChapterId { get; set; }
        public DateTime DatetimeRead { get; set; } = DateTime.Now;
    }
}