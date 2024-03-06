using API.Entities;

namespace API.Interfaces
{
    public interface IChapterPhotoRepository
    {
        Task AddRange(List<ChapterPhoto> chapterPhotos);
        Task Add(ChapterPhoto chapterPhoto);
        void Delete(ChapterPhoto chapterPhoto);
        void DeleteRange(List<ChapterPhoto> chapterPhotos);
        IQueryable<ChapterPhoto> GetAll();
    }
}