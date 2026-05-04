namespace Billing_System.Services.Email;

public sealed class EmailOptions
{
    public bool Enabled { get; set; } = false;

    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public bool UseStartTls { get; set; } = true;

    public string Username { get; set; } = string.Empty;
    public string AppPassword { get; set; } = string.Empty;

    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "Billing System";
}

