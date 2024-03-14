using API.Entities;

namespace API.Interfaces
{
    public interface IComicFollowRepository
    {
        Task Add(ComicFollow comicFollow);
        void Update(ComicFollow comicFollow);
        void Delete(ComicFollow comicFollow);
        IQueryable<ComicFollow> GetAll();
    }
}