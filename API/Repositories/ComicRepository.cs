using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class ComicRepository : IComicRepository
    {
        private readonly DataContext _context;

        public ComicRepository(DataContext context)
        {
            _context = context;
        }
        public async Task Add(Comic comic)
        {
            await _context.Comics.AddAsync(comic);
        }

        public void Delete(Comic comic)
        {
            _context.Comics.Remove(comic);
        }

        public IQueryable<Comic> GetAll(){
            return _context.Comics.AsTracking();
        }

        public void Update(Comic comic)
        {
            _context.Comics.Update(comic);
        }
    }
}