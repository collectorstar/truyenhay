namespace API.Entities
{
    public class RatingComic
    {
        public int Id { get; set; }
        public int Userid { get; set; }
        public int ComicId { get; set; }
        public int Rating { get; set; }
        public DateTime CreationTime { get; set; } = DateTime.Now;
    }
}