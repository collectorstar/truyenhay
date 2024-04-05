namespace API.Helpers
{
    public class UserForAssignPermistionParam : PaginationParams
    {
        public string Email { get; set; }
        public bool OnlyAdmin { get; set; }
    }
}