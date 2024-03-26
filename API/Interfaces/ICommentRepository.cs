using API.Entities;

namespace API.Interfaces
{
    public interface ICommentRepository
    {
        Task Add(Comment comment);
        void Delete(Comment comment);
        void DeleteRange(List<Comment> comments);
        IQueryable<Comment> GetAll();
    }
}