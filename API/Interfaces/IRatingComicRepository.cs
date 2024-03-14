using API.Entities;

namespace API.Interfaces
{
    public interface IRatingComicRepository
    {
        Task Add(RatingComic ratingComic);
        void Update(RatingComic ratingComic);
        void Delete(RatingComic ratingComic);
        IQueryable<RatingComic> GetAll();
    }
}