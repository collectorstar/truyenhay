using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class ComicFollowRepository : IComicFollowRepository
    {
        private readonly DataContext _context;

        public ComicFollowRepository(DataContext context)
        {
            _context = context;
        }

        public async Task Add(ComicFollow comicFollow)
        {
            await _context.ComicFollows.AddAsync(comicFollow);
        }

        public void Delete(ComicFollow comicFollow)
        {
            _context.ComicFollows.Remove(comicFollow);
        }

        public void DeleteRange(List<ComicFollow> comicFollows)
        {
            _context.ComicFollows.RemoveRange(comicFollows);
        }

        public IQueryable<ComicFollow> GetAll()
        {
            return _context.ComicFollows.AsTracking();
        }

        public void Update(ComicFollow comicFollow)
        {
            _context.ComicFollows.Update(comicFollow);
        }
    }
}