using API.Entities;

namespace API.Interfaces
{
    public interface IComicRepository
    {
        Task Add(Comic comic);
        void Update(Comic comic);
        void Delete(Comic comic);
        void DeleteRange(List<Comic> comics);
        IQueryable<Comic> GetAll();
    }
}