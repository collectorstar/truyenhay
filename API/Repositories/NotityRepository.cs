using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class NotityRepository : INotityRepository
    {
        private readonly DataContext _context;

        public NotityRepository(DataContext context)
        {
            _context = context;
        }

        public async Task Add(Notify notify)
        {
            await _context.Notifys.AddAsync(notify);
        }

        public async Task AddRange(List<Notify> notifies)
        {
            await _context.Notifys.AddRangeAsync(notifies);
        }

        public void Delete(Notify notify)
        {
            _context.Notifys.Remove(notify);
        }

        public void DeleteRange(List<Notify> notifies)
        {
            _context.Notifys.RemoveRange(notifies);
        }

        public IQueryable<Notify> GetAll()
        {
            return _context.Notifys.AsTracking();
        }
    }
}