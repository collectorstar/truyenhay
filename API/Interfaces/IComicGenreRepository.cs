using API.Entities;

namespace API.Interfaces
{
    public interface IComicGenreRepository
    {
        Task Add(ComicGenre comicGenre);
        Task AddRange(List<ComicGenre> list);
        void Delete(ComicGenre comicGenre);
        void DeleteRange(List<ComicGenre> comicGenres);
        IQueryable<ComicGenre> GetAll();
    }
}