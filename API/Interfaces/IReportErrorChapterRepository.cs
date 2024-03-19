using API.Entities;

namespace API.Interfaces
{
    public interface IReportErrorChapterRepository
    {
        Task Add(ReportErrorChapter reportError);
        void Delete(ReportErrorChapter reportErrorChapter);
        void DeleteRange(List<ReportErrorChapter> reportErrorChapters);
        IQueryable<ReportErrorChapter> GetAll();
    }
}