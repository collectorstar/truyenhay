using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Policy = "RequireAdminRole")]
    public class GenreController : BaseApiController
    {
        private readonly IUnitOfWork _unitOfWork;

        public GenreController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<GenreDto>>> GetAll([FromQuery] GenreParams genreParams)
        {
            var result = await _unitOfWork.GenreRepository.GetGenresByName(genreParams);

            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPages));

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> CreateOrEdit(CreateOrEditGenreDto dto)
        {
            if (dto.Id != null)
            {
                var find = _unitOfWork.GenreRepository.GetGenreById((int)dto.Id);
                if (find == null) return BadRequest("Data not found");
                var check = _unitOfWork.GenreRepository.GetGenreByNameAndOtherId((int)dto.Id, dto.Name.Trim());
                if (check != null) return BadRequest("Name is exist");

                find.Name = dto.Name;
                find.Desc = dto.Desc;
                find.IsFeatured = dto.IsFeatured;
                find.Status = dto.Status;
                var abc = await _unitOfWork.Complete();
                if (abc) return Ok(new { message = "Update success!" });

                return BadRequest("Nothing changes");
            }
            else
            {
                var check = _unitOfWork.GenreRepository.GetGenreByName(dto.Name);
                if (check != null) return BadRequest("Name is exist");

                Genre data = new Genre
                {
                    Name = dto.Name,
                    Desc = dto.Desc,
                    IsFeatured = dto.IsFeatured,
                    Status = dto.Status,
                };

                await _unitOfWork.GenreRepository.AddGenre(data);

                if (await _unitOfWork.Complete()) return Ok(new {message = "Add success!"});

                return BadRequest("Something error happen");
            }
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteGenre(int id)
        {
            _unitOfWork.GenreRepository.Delete(id);
            if (await _unitOfWork.Complete()) return Ok(new {message = "Delete success!"});
            return BadRequest("Data not found");
        }


    }
}