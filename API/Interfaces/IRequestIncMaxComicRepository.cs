using API.Entities;

namespace API.Interfaces
{
    public interface IRequestIncMaxComicRepository
    {
        Task Add(RequestIncMaxComic requestIncMaxComic);
        void Delete(RequestIncMaxComic requestIncMaxComic);
        void DeleteRange(List<RequestIncMaxComic> requestIncMaxComics);
        IQueryable<RequestIncMaxComic> GetAll();
    }
}