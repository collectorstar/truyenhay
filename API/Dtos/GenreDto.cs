using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dtos
{
    public class GenreDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Desc { get; set; }
        public bool IsFeatured { get; set; }
        public bool Status { get; set; }
        public DateTime CreationTime { get; set; }
    }
}