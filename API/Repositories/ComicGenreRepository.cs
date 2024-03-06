using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class ComicGenreRepository : IComicGenreRepository
    {
        private readonly DataContext _context;

        public ComicGenreRepository(DataContext context)
        {
            _context = context;
        }
        public async Task Add(ComicGenre comicGenre)
        {
            await _context.ComicGenres.AddAsync(comicGenre);
        }

        public async Task AddRange(List<ComicGenre> list)
        {
            await _context.ComicGenres.AddRangeAsync(list);
        }

        public void Delete(ComicGenre comicGenre)
        {
            _context.ComicGenres.Remove(comicGenre);
        }

        public void DeleteRange(List<ComicGenre> comicGenres)
        {
            _context.ComicGenres.RemoveRange(comicGenres);
        }

        public IQueryable<ComicGenre> GetAll()
        {
            return _context.ComicGenres.AsTracking();
        }
    }
}