namespace API.Interfaces
{
    public interface IUnitOfWork
    {
        IGenreRepository GenreRepository { get; }
        IPhotoAvatarRepository PhotoAvatarRepository { get; }
        IRequestAuthorRepository RequestAuthorRepository { get; }
        IComicRepository ComicRepository { get; }
        IPhotoComicRepository PhotoComicRepository { get; }
        IChapterRepository ChapterRepository { get; }
        IChapterPhotoRepository ChapterPhotoRepository { get; }
        IComicGenreRepository ComicGenreRepository { get; }
        IRatingComicRepository RatingComicRepository { get; }
        IComicFollowRepository ComicFollowRepository { get; }

        Task<bool> Complete();
        bool HasChanges();
    }
}