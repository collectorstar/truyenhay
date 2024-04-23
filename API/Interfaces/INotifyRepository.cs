using API.Entities;

namespace API.Interfaces
{
    public interface INotifyRepository
    {
        Task Add(Notify notify);
        Task AddRange(List<Notify> notifies);
        void Delete(Notify notify);
        void DeleteRange(List<Notify> notifies);
        IQueryable<Notify> GetAll();
    }
}