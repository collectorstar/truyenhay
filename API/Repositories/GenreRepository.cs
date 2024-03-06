using API.Data;
using API.Dtos;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class GenreRepository : IGenreRepository
    {
        private readonly DataContext _context;

        public GenreRepository(DataContext context)
        {
            _context = context;
        }

        public Genre GetGenreById(int id)
        {
            return _context.Genres.FirstOrDefault(x => x.Id == id);
        }

        public Genre GetGenreByNameAndOtherId(int id, string name)
        {
            return _context.Genres.FirstOrDefault(x => x.Id != id && x.Name == name);
        }

        public async Task<PagedList<GenreDto>> GetGenresByName(GenreParams genreParams)
        {
            var query = _context.Genres.AsQueryable();

            query = query.Where(x => string.IsNullOrWhiteSpace(genreParams.Name) || x.Name.Contains(genreParams.Name));

            var result = from x in query.AsNoTracking()
                         select new GenreDto
                         {
                             Id = x.Id,
                             Name = x.Name,
                             Desc = x.Desc,
                             IsFeatured = x.IsFeatured,
                             Status = x.Status,
                             CreationTime = x.CreationTime
                         };
            return await PagedList<GenreDto>.CreateAsync(result,genreParams.PageNumber,genreParams.PageSize);
        }

        public Genre GetGenreByName(string name)
        {
            return _context.Genres.FirstOrDefault(x => x.Name == name);
        }

        public async Task AddGenre(Genre dto)
        {
            await _context.Genres.AddAsync(dto);

        }

        public void Delete(int id)
        {
            var check = _context.Genres.FirstOrDefault(x => x.Id == id);
            if (check != null)
            {
                _context.Genres.Remove(check);
            }
        }

        public IQueryable<Genre> GetAll()
        {
            return _context.Genres.AsTracking();
        }

        public void Update(Genre dto)
        {
            _context.Genres.Update(dto);
        }

    }
}