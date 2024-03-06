using API.Entities;

namespace API.Interfaces
{
    public interface IRequestAuthorRepository
    {
        Task Create(RequestAuthor request);
        Task<RequestAuthor> GetRequestToDay(int userId);
    }
}