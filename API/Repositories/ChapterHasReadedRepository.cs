using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class ChapterHasReadedRepository : IChapterHasReadedRepository
    {
        private readonly DataContext _context;

        public ChapterHasReadedRepository(DataContext context)
        {
            _context = context;
        }

        public async Task Add(ChapterHasReaded chapterHasReaded)
        {
            await _context.ChapterHasReadeds.AddAsync(chapterHasReaded);
        }

        public async Task AddRange(List<ChapterHasReaded> chapterHasReadeds)
        {
            await _context.ChapterHasReadeds.AddRangeAsync(chapterHasReadeds);
        }

        public void Delete(ChapterHasReaded chapterHasReaded)
        {
            _context.ChapterHasReadeds.Remove(chapterHasReaded);
        }

        public void DeleteRange(List<ChapterHasReaded> chapterHasReadeds)
        {
            _context.ChapterHasReadeds.RemoveRange(chapterHasReadeds);
        }

        public IQueryable<ChapterHasReaded> GetAll()
        {
            return _context.ChapterHasReadeds.AsTracking();
        }
    }
}