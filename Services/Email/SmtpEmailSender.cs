using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Billing_System.Services.Email;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<EmailOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string textBody, CancellationToken cancellationToken = default)
    {
        await SendAsync(toEmail, subject, textBody, Array.Empty<EmailAttachment>(), cancellationToken);
    }

    public async Task SendAsync(
        string toEmail,
        string subject,
        string textBody,
        IReadOnlyList<EmailAttachment> attachments,
        CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
            return;

        if (string.IsNullOrWhiteSpace(_options.Host) ||
            string.IsNullOrWhiteSpace(_options.Username) ||
            string.IsNullOrWhiteSpace(_options.AppPassword) ||
            string.IsNullOrWhiteSpace(_options.FromEmail))
        {
            _logger.LogWarning("Email is enabled but SMTP settings are incomplete.");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.FromName, _options.FromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject ?? string.Empty;

        var builder = new BodyBuilder();
        if (textBody != null && textBody.TrimStart().StartsWith("<"))
        {
            builder.HtmlBody = textBody;
        }
        else
        {
            builder.TextBody = textBody ?? string.Empty;
        }

        if (attachments is { Count: > 0 })
        {
            foreach (var attachment in attachments)
            {
                if (attachment.Content is not { Length: > 0 })
                    continue;

                builder.Attachments.Add(attachment.FileName, attachment.Content, ContentType.Parse(attachment.ContentType));
            }
        }

        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();

        var socketOptions = _options.UseStartTls
            ? SecureSocketOptions.StartTls
            : SecureSocketOptions.SslOnConnect;

        await client.ConnectAsync(_options.Host, _options.Port, socketOptions, cancellationToken);
        await client.AuthenticateAsync(_options.Username, _options.AppPassword, cancellationToken);
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}

