using System.Security.Cryptography;
using System.Text;
using Billing_System.Data;
using Billing_System.Services.Payments;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Razorpay.Api;

namespace Billing_System.Controllers;

[Route("api/[controller]")]
[ApiController]
public sealed class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly RazorpayOptions _options;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(AppDbContext context, IOptions<RazorpayOptions> options, ILogger<PaymentsController> logger)
    {
        _context = context;
        _options = options.Value;
        _logger = logger;
    }

    [HttpPost("create-order")]
    public async Task<ActionResult<CreateOrderResponse>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        if (!_options.Enabled)
            return BadRequest(new { message = "Razorpay is disabled" });

        if (string.IsNullOrWhiteSpace(_options.KeyId) || string.IsNullOrWhiteSpace(_options.KeySecret))
            return BadRequest(new { message = "Razorpay keys are not configured" });

        var invoice = await _context.Invoices.FirstOrDefaultAsync(b => b.Id == request.InvoiceId);
        if (invoice == null)
            return NotFound(new { message = "Invoice not found" });

        // Razorpay expects smallest currency unit (paise)
        var amountPaise = (long)Math.Round(invoice.GrandTotal * 100m, MidpointRounding.AwayFromZero);
        if (amountPaise <= 0)
            return BadRequest(new { message = "Invalid invoice amount" });

        var client = new RazorpayClient(_options.KeyId, _options.KeySecret);

        var orderOptions = new Dictionary<string, object>
        {
            ["amount"] = amountPaise,
            ["currency"] = _options.Currency,
            ["receipt"] = $"invoice_{invoice.Id}",
            ["payment_capture"] = 1
        };

        Order order;
        try
        {
            order = client.Order.Create(orderOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Razorpay order creation failed for invoice {InvoiceId}", invoice.Id);
            return StatusCode(502, new { message = "Failed to create Razorpay order" });
        }

        var orderId = order["id"]?.ToString() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(orderId))
            return StatusCode(502, new { message = "Razorpay returned invalid order id" });

        return Ok(new CreateOrderResponse(
            KeyId: _options.KeyId,
            OrderId: orderId,
            Amount: amountPaise,
            Currency: _options.Currency,
            BusinessName: _options.BusinessName,
            InvoiceId: invoice.Id));
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] VerifyPaymentRequest request)
    {
        if (!_options.Enabled)
            return BadRequest(new { message = "Razorpay is disabled" });

        if (string.IsNullOrWhiteSpace(_options.KeySecret))
            return BadRequest(new { message = "Razorpay keys are not configured" });

        var invoice = await _context.Invoices.FirstOrDefaultAsync(b => b.Id == request.InvoiceId);
        if (invoice == null)
            return NotFound(new { message = "Invoice not found" });

        if (string.IsNullOrWhiteSpace(request.RazorpayOrderId) ||
            string.IsNullOrWhiteSpace(request.RazorpayPaymentId) ||
            string.IsNullOrWhiteSpace(request.RazorpaySignature))
        {
            return BadRequest(new { message = "Missing payment fields" });
        }

        var payload = $"{request.RazorpayOrderId}|{request.RazorpayPaymentId}";
        var expected = ComputeHmacSha256Hex(payload, _options.KeySecret);

        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expected),
                Encoding.UTF8.GetBytes(request.RazorpaySignature)))
        {
            return Unauthorized(new { message = "Invalid signature" });
        }

        // For dev phase: we only verify signature and return success.
        // If you want, we can persist payment status in DB (Payments table) and mark invoice as Paid.
        return Ok(new { message = "Payment verified", invoiceId = invoice.Id });
    }

    private static string ComputeHmacSha256Hex(string data, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        var sb = new StringBuilder(hash.Length * 2);
        foreach (var b in hash)
            sb.Append(b.ToString("x2"));
        return sb.ToString();
    }
}

