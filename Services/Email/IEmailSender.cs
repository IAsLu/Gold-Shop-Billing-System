namespace Billing_System.Services.Email;

public interface IEmailSender
{
    Task SendAsync(string toEmail, string subject, string textBody, CancellationToken cancellationToken = default);

    Task SendAsync(
        string toEmail,
        string subject,
        string textBody,
        IReadOnlyList<EmailAttachment> attachments,
        CancellationToken cancellationToken = default);
}

