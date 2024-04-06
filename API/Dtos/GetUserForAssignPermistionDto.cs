namespace API.Dtos
{
    public class GetUserForAssignPermistionDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public DateTime CreationTime { get; set; }
        public bool IsAdmin { get; set; }
    }
}