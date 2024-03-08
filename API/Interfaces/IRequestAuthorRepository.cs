using API.Entities;

namespace API.Interfaces
{
    public interface IRequestAuthorRepository
    {
        Task Create(RequestAuthor request);
        Task<RequestAuthor> GetRequestToDay(int userId);
        void Delete(RequestAuthor requestAuthor);
        void DeleteRange(List<RequestAuthor> requestAuthors);
        IQueryable<RequestAuthor> GetAll();
    }
}