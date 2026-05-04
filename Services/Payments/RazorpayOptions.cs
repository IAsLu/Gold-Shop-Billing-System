namespace Billing_System.Services.Payments;

public sealed class RazorpayOptions
{
    public bool Enabled { get; set; } = false;
    public string KeyId { get; set; } = string.Empty;
    public string KeySecret { get; set; } = string.Empty;
    public string BusinessName { get; set; } = "Billing System";
    public string Currency { get; set; } = "INR";
}

