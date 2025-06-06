using API.Data;
using API.Interfaces;

namespace API.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly DataContext _context;

        public UnitOfWork(DataContext context)
        {
            _context = context;
        }
        public IGenreRepository GenreRepository => new GenreRepository(_context);
        public IPhotoAvatarRepository PhotoAvatarRepository => new PhotoAvatarRepository(_context);
        public IRequestAuthorRepository RequestAuthorRepository => new RequestAuthorRepository(_context);
        public IComicRepository ComicRepository => new ComicRepository(_context);
        public IPhotoComicRepository PhotoComicRepository => new PhotoComicRepository(_context);
        public IChapterRepository ChapterRepository => new ChapterRepository(_context);
        public IChapterPhotoRepository ChapterPhotoRepository => new ChapterPhotoRepository(_context);
        public IComicGenreRepository ComicGenreRepository => new ComicGenreRepository(_context);
        public IRatingComicRepository RatingComicRepository => new RatingComicRepository(_context);
        public IComicFollowRepository ComicFollowRepository => new ComicFollowRepository(_context);
        public IChapterHasReadedRepository ChapterHasReadedRepository => new ChapterHasReadedRepository(_context);
        public IReportErrorChapterRepository ReportErrorChapterRepository => new ReportErrorChapterRepository(_context);
        public IRequestIncMaxComicRepository RequestIncMaxComicRepository => new RequestIncMaxComicRepository(_context);
        public ICommentRepository CommentRepository => new CommentRepository(_context);
        public INotifyRepository NotifyRepository => new NotifyRepository(_context);
        public async Task<bool> Complete()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public bool HasChanges()
        {
            return _context.ChangeTracker.HasChanges();
        }
        public async Task BeginTransactionAsync()
        {
            await _context.Database.BeginTransactionAsync();
        }
        public void CommitTransaction()
        {
            _context.Database.CommitTransaction();
        }
        public void RollbackTransaction()
        {
            _context.Database.RollbackTransaction();
        }
    }
}