using API.Entities;

namespace API.Interfaces
{
    public interface IPhotoAvatarRepository
    {
        Task Add(PhotoAvatar photoAvatar);
        IQueryable<PhotoAvatar> GetAll();
        void DeletePhotoAvatar(PhotoAvatar entity);
    }
}