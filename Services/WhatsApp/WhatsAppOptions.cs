namespace Billing_System.Services.WhatsApp;

public class WhatsAppOptions
{
    public bool Enabled { get; set; } = false;
    public string? AccessToken { get; set; }
    public string? PhoneNumberId { get; set; }
    public string ApiVersion { get; set; } = "v20.0";
    public string? FromDisplayName { get; set; }
}

