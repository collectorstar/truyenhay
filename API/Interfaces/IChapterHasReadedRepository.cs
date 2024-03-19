using API.Entities;

namespace API.Interfaces
{
    public interface IChapterHasReadedRepository
    {
        Task AddRange(List<ChapterHasReaded> chapterHasReadeds);
        Task Add(ChapterHasReaded chapterHasReaded);
        void Delete(ChapterHasReaded chapterHasReaded);
        void DeleteRange(List<ChapterHasReaded> chapterHasReadeds);
        IQueryable<ChapterHasReaded> GetAll();
    }
}