
namespace API.Dtos
{
    public class CreateOrEditComicDto
    {
        public int? Id { get; set; }

        public string Name { get; set; }
        public string AuthorName { get; set; }

        public string Desc { get; set; }

        public bool Status { get; set; }
        public bool IsCompleted { get; set; }
        public int AuthorId { get; set; }
        // public List<GenreForUploadComicDto> ListGenre { get; set; }
        public string ListGenre { get; set; }
        public IFormFile File { get; set; }
    }
}