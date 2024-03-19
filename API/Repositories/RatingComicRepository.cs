using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class RatingComicRepository : IRatingComicRepository
    {
        private readonly DataContext _context;

        public RatingComicRepository(DataContext context)
        {
            _context = context;
        }

        public async Task Add(RatingComic ratingComic)
        {
            await _context.RatingComics.AddAsync(ratingComic);
        }

        public void Delete(RatingComic ratingComic)
        {
            _context.RatingComics.Remove(ratingComic);
        }

        public void DeleteRange(List<RatingComic> ratingComics)
        {
            _context.RatingComics.RemoveRange(ratingComics);
        }

        public IQueryable<RatingComic> GetAll()
        {
            return _context.RatingComics.AsTracking();
        }

        public void Update(RatingComic ratingComic)
        {
            _context.RatingComics.Update(ratingComic);
        }
    }
}