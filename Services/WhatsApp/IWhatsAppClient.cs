namespace Billing_System.Services.WhatsApp;

public interface IWhatsAppClient
{
    Task SendTextAsync(string toE164, string messageBody, CancellationToken cancellationToken = default);
}

