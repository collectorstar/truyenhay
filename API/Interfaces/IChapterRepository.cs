using API.Entities;

namespace API.Interfaces
{
    public interface IChapterRepository
    {
        Task Add(Chapter chapter);
        void Delete(Chapter chapter);
        void DeleteRange(List<Chapter> chapters);
        IQueryable<Chapter> GetAll();
    }
}