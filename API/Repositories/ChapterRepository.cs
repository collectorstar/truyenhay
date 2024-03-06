using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class ChapterRepository : IChapterRepository
    {
        private readonly DataContext _context;

        public ChapterRepository(DataContext context)
        {
            _context = context;
        }
        public async Task Add(Chapter chapter)
        {
            await _context.Chapters.AddAsync(chapter);
        }

        public void Delete(Chapter chapter)
        {
            _context.Chapters.Remove(chapter);
        }

        public void DeleteRange(List<Chapter> chapters)
        {
            _context.Chapters.RemoveRange(chapters);
        }

        public IQueryable<Chapter> GetAll()
        {
            return _context.Chapters.AsTracking();
        }

    }
}