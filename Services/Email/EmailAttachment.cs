namespace Billing_System.Services.Email;

public sealed record EmailAttachment(string FileName, byte[] Content, string ContentType);

