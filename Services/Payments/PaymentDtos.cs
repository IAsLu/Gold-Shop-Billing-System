namespace Billing_System.Services.Payments;

public sealed record CreateOrderRequest(int InvoiceId);

public sealed record CreateOrderResponse(
    string KeyId,
    string OrderId,
    long Amount,
    string Currency,
    string BusinessName,
    int InvoiceId);

public sealed record VerifyPaymentRequest(
    int InvoiceId,
    string RazorpayOrderId,
    string RazorpayPaymentId,
    string RazorpaySignature);

