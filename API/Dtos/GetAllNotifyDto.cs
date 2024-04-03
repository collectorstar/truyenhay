
namespace API.Dtos
{
    public class GetAllNotifyDto
    {
        public int Id { get; set; }
        public DateTime CreationTime { get; set; }
        public string Message { get; set; }
        public string Link { get; set; }
        public string Image { get; set; }
        public bool IsReaded { get; set; }
    }
}