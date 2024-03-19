using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class ReportErrorChapterRepository : IReportErrorChapterRepository
    {
        private readonly DataContext _context;

        public ReportErrorChapterRepository(DataContext context)
        {
            _context = context;
        }

        public async Task Add(ReportErrorChapter reportError)
        {
            await _context.ReportErrorChapters.AddAsync(reportError);
        }

        public void Delete(ReportErrorChapter reportErrorChapter)
        {
            _context.ReportErrorChapters.Remove(reportErrorChapter);
        }

        public void DeleteRange(List<ReportErrorChapter> reportErrorChapters)
        {
            _context.ReportErrorChapters.RemoveRange(reportErrorChapters);
        }

        public IQueryable<ReportErrorChapter> GetAll()
        {
            return _context.ReportErrorChapters.AsTracking();
        }
    }
}