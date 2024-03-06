using API.Data;

namespace API.Interfaces
{
    public interface ISendEmailService
    {
        Task<bool> SendMail(MailContent mailContent);
    }
}