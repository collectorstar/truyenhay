using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class PhotoComicRepository : IPhotoComicRepository
    {
        private readonly DataContext _context;

        public PhotoComicRepository(DataContext context)
        {
            _context = context;
        }
        public async Task Add(PhotoComic photoComic)
        {
            await _context.PhotoComics.AddAsync(photoComic);
        }

        public void Delete(PhotoComic photoComic)
        {
            _context.PhotoComics.Remove(photoComic);
        }

        public IQueryable<PhotoComic> GetAll()
        {
            return _context.PhotoComics.AsTracking();
        }
    }
}