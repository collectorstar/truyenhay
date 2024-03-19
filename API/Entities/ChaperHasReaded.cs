namespace API.Entities
{
    public class ChapterHasReaded
    {
        public int UserId { get; set; }
        public int ChapterId { get; set; }
        public DateTime DatetimeRead { get; set; } = DateTime.Now;
    }
}