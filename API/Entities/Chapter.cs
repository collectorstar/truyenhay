using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    public class Chapter
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Status { get; set; }
        public DateTime CreationTime { get; set; }
        public bool IsDeleted { get; set; }
        public int ComicId { get; set; }
    }
}