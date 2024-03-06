using API.Dtos;
using API.Entities;
using API.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace API.Interfaces
{
    public interface IGenreRepository
    {
        Task AddGenre(Genre genre);
        void Update(Genre genre);
        void Delete(int id);
        IQueryable<Genre> GetAll();
        Genre GetGenreById(int id);
        Genre GetGenreByNameAndOtherId(int id, string name);
        Task<PagedList<GenreDto>> GetGenresByName(GenreParams genreParams);
        Genre GetGenreByName(string name);

    }
}