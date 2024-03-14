namespace API.Entities
{
    public class ComicFollow
    {
        public DateTime CreationTime { get; set; }
        public int UserFollowedId { get; set; }
        public int ComicFollowedId { get; set; }
    }
}