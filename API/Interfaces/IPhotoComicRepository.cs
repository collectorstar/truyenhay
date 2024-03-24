using API.Entities;

namespace API.Interfaces
{
    public interface IPhotoComicRepository
    {
        Task Add(PhotoComic photoComic);
        void Delete(PhotoComic photoComic);
        void DeleteRange(List<PhotoComic> photoComics);
        IQueryable<PhotoComic> GetAll();
    }
}