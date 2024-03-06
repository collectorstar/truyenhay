using API.Data;
using API.Dtos;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class ChapterPhotoRepository : IChapterPhotoRepository
    {
        private readonly DataContext _context;

        public ChapterPhotoRepository(DataContext context)
        {
            _context = context;
        }
        public async Task AddRange(List<ChapterPhoto> chapterPhotos)
        {
            await _context.ChapterPhotos.AddRangeAsync(chapterPhotos);
        }

        public async Task Add(ChapterPhoto chapterPhoto)
        {
            await _context.ChapterPhotos.AddAsync(chapterPhoto);
        }

        public void DeleteRange(List<ChapterPhoto> chapterPhotos)
        {
            _context.ChapterPhotos.RemoveRange(chapterPhotos);
        }

        public void Delete(ChapterPhoto chapterPhoto)
        {
            _context.ChapterPhotos.Remove(chapterPhoto);
        }


        public IQueryable<ChapterPhoto> GetAll()
        {
            return _context.ChapterPhotos.AsTracking();
        }
    }
}