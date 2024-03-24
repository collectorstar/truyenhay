using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class RequestIncMaxComicRepository : IRequestIncMaxComicRepository
    {
        private readonly DataContext _context;

        public RequestIncMaxComicRepository(DataContext context)
        {
            _context = context;
        }

        public async Task Add(RequestIncMaxComic requestIncMaxComic)
        {
            await _context.RequestIncMaxComics.AddAsync(requestIncMaxComic);
        }

        public void Delete(RequestIncMaxComic requestIncMaxComic)
        {
            _context.RequestIncMaxComics.Remove(requestIncMaxComic);
        }

        public void DeleteRange(List<RequestIncMaxComic> requestIncMaxComics)
        {
            _context.RequestIncMaxComics.RemoveRange(requestIncMaxComics);
        }

        public IQueryable<RequestIncMaxComic> GetAll()
        {
            return _context.RequestIncMaxComics.AsTracking();
        }
    }
}