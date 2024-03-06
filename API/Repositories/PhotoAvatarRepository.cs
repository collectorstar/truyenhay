using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class PhotoAvatarRepository : IPhotoAvatarRepository
    {
        private readonly DataContext _context;

        public PhotoAvatarRepository(DataContext context)
        {
            _context = context;
        }
        public async Task Add(PhotoAvatar photoAvatar)
        {
            await _context.PhotoAvatars.AddAsync(photoAvatar);
        }

        public IQueryable<PhotoAvatar> GetAll()
        {
            return _context.PhotoAvatars.AsTracking();
        }

        public void DeletePhotoAvatar(PhotoAvatar entity)
        {
            _context.PhotoAvatars.Remove(entity);
        }
    }
}