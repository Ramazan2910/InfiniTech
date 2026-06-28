namespace InfiniTech.Application.Services.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink);
    Task SendWelcomeEmailAsync(string toEmail, string firstName);
    Task SendTempPasswordEmailAsync(string toEmail, string firstName, string tempPassword);
}
