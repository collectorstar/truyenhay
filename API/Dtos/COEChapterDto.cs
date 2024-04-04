namespace API.Dtos
{
    public class COEChapterDto
    {
        public int? Id { get; set; }
        public int ComicId { get; set; }
        public bool Status { get; set; }
        public string Name { get; set; }
        public int Rank { get; set; }
        public IFormFileCollection Files { get; set; }
    }
}