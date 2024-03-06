namespace API.Dtos
{
    public class CreateOrEditGenreDto
    {
        public int? Id { get; set; }
        public string Name { get; set; }
        public string Desc { get; set; }
        public bool IsFeatured { get; set; }
        public bool Status { get; set; }
    }
}