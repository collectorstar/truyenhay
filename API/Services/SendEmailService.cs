using System.Text;
using API.Data;
using API.Interfaces;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace API.Services
{
    public class SendEmailService : ISendEmailService
    {
       public MailSettings _mailSettings { get; set; }

        public SendEmailService(IOptions<MailSettings> mailsettings)
        {
            _mailSettings = mailsettings.Value;
        }
        public async Task<bool> SendMail(MailContent mailContent)
        {
            var email = new MimeMessage();
            email.Sender = new MailboxAddress(_mailSettings.DisplayName, _mailSettings.Mail);
            email.From.Add(new MailboxAddress(_mailSettings.DisplayName,_mailSettings.Mail));
            email.To.Add(new MailboxAddress(mailContent.To,mailContent.To));
            email.Subject = mailContent.Subject;

            var builder = new BodyBuilder();
            builder.HtmlBody = mailContent.Body;

            email.Body = builder.ToMessageBody();

            using var smtp = new MailKit.Net.Smtp.SmtpClient();

            try
            {
                smtp.Connect(_mailSettings.Host, _mailSettings.Port, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_mailSettings.Mail, _mailSettings.PasswordApp);
                await smtp.SendAsync(email);
            }catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return false;
            }

            smtp.Disconnect(true);
            return true;
        } 
    }
}