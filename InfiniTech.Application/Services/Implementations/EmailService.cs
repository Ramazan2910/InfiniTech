using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Application.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace InfiniTech.Application.Services.Implementations;

public class EmailService : IEmailService
{
    private readonly SmtpSettings _smtp;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<SmtpSettings> smtp, ILogger<EmailService> logger)
    {
        _smtp = smtp.Value;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        if (!_smtp.IsConfigured)
        {
            _logger.LogWarning("[DEV] Password reset link for {Email}: {Link}", toEmail, resetLink);
            return;
        }
        var subject = "Сброс пароля — InfiniTech";
        var body = $"""
            <h2>Сброс пароля</h2>
            <p>Вы запросили сброс пароля. Перейдите по ссылке ниже:</p>
            <p><a href="{resetLink}">{resetLink}</a></p>
            <p>Ссылка действительна 1 час. Если вы не запрашивали сброс пароля — проигнорируйте это письмо.</p>
            """;
        await SendAsync(toEmail, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string firstName)
    {
        if (!_smtp.IsConfigured)
        {
            _logger.LogInformation("[DEV] Welcome email would be sent to {Email}", toEmail);
            return;
        }
        var subject = "Добро пожаловать в InfiniTech!";
        var body = $"<h2>Привет, {firstName}!</h2><p>Ваш аккаунт успешно создан.</p>";
        await SendAsync(toEmail, subject, body);
    }

    public async Task SendTempPasswordEmailAsync(string toEmail, string firstName, string tempPassword)
    {
        if (!_smtp.IsConfigured)
        {
            _logger.LogWarning("[DEV] Temp password for {Email}: {Password}", toEmail, tempPassword);
            return;
        }
        var subject = "Временный пароль — InfiniTech";
        var body = $"""
            <h2>Привет, {firstName}!</h2>
            <p>Администратор сбросил ваш пароль. Ваш временный пароль:</p>
            <p><strong>{tempPassword}</strong></p>
            <p>Пожалуйста, войдите и смените пароль.</p>
            """;
        await SendAsync(toEmail, subject, body);
    }

    private async Task SendAsync(string to, string subject, string htmlBody)
    {
        using var client = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(_smtp.Username, _smtp.Password)
        };
        using var msg = new MailMessage
        {
            From = new MailAddress(_smtp.FromEmail, _smtp.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
        };
        msg.To.Add(to);
        await client.SendMailAsync(msg);
    }
}
