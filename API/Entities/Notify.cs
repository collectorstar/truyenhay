using API.Helpers;

namespace API.Entities
{
    public class Notify
    {
        public int Id { get; set; }
        public DateTime CreationTime { get; set; }
        public int ComicIdRef { get; set; }
        public int ChapterIdRef { get; set; }
        public int UserRecvId { get; set; }
        public string Message { get; set; }
        public NotifyType Type { get; set; }
        public bool IsReaded { get; set; }
    }
}