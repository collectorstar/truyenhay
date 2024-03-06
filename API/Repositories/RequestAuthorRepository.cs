using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class RequestAuthorRepository : IRequestAuthorRepository
    {
        private readonly DataContext _context;

        public RequestAuthorRepository(DataContext context)
        {
            _context = context;
        }
        public async Task Create(RequestAuthor request)
        {
            await _context.RequestAuthors.AddAsync(request);
        }

        public async Task<RequestAuthor> GetRequestToDay(int userId)
        {
            return await _context.RequestAuthors.FirstOrDefaultAsync(x => x.UserId == userId && x.CreationTime.Date == DateTime.Now.Date);
        }
    }
}