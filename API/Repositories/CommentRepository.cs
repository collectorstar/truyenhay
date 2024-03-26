using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly DataContext _context;

        public CommentRepository(DataContext context)
        {
            _context = context;
        }

        public async Task Add(Comment comment)
        {
            await _context.AddAsync(comment);
        }

        public void Delete(Comment comment)
        {
            _context.Comments.Remove(comment);
        }

        public void DeleteRange(List<Comment> comments)
        {
            _context.Comments.RemoveRange(comments);
        }

        public IQueryable<Comment> GetAll()
        {
            return _context.Comments.AsTracking();
        }

    }
}