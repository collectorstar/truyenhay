using CloudinaryDotNet.Actions;

namespace API.Interfaces
{
    public interface IPhotoService
    {
        Task<ImageUploadResult> UploadAvatar(IFormFile file);
        Task<DeletionResult> DeletePhotoAsync(string publicId);
        Task<ImageUploadResult> UploadImageComic(IFormFile file);
        Task<DelResResult> DeleteListPhotoAsync(List<string> publicIds);
        Task<ImageUploadResult> UploadImageChapter(IFormFile file);
    }
}