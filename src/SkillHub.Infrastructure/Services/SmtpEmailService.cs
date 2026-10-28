using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SkillHub.Application.Interfaces;

namespace SkillHub.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var smtpSection = _configuration.GetSection("Smtp");
        var host = smtpSection["Host"];
        var portStr = smtpSection["Port"];
        var username = smtpSection["Username"];
        var rawPassword = smtpSection["Password"];
        var fromName = smtpSection["FromName"] ?? "SkillHub — Plataforma de Talleres";
        var enableSsl = !bool.TryParse(smtpSection["EnableSsl"], out var ssl) || ssl;

        if (string.IsNullOrWhiteSpace(host) ||
            string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(rawPassword))
        {
            _logger.LogInformation(
                "[Simulated Local Email] To: {To} | Subject: {Subject}",
                toEmail,
                subject);
            return false;
        }

        var password = rawPassword.Replace(" ", string.Empty).Trim();
        var port = int.TryParse(portStr, out var parsedPort) ? parsedPort : 587;

        try
        {
            using var client = new SmtpClient(host.Trim(), port)
            {
                Credentials = new NetworkCredential(username.Trim(), password),
                EnableSsl = enableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Timeout = 10000
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(username.Trim(), fromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail.Trim());

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Email successfully sent via SMTP ({Host}) to {To}.", host, toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Failed to send email via SMTP to {To}. Falling back to local token display.",
                toEmail);
            return false;
        }
    }
}
