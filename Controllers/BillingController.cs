using Billing_System.Data;
using Billing_System.Models;
using Billing_System.Services.Email;
using Billing_System.Services.Invoices;
using Billing_System.Services.WhatsApp;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Billing_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BillingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWhatsAppClient _whatsAppClient;
        private readonly IEmailSender _emailSender;
        private readonly IInvoicePdfGenerator _invoicePdfGenerator;
        private readonly WhatsAppOptions _options;
        private readonly ILogger<BillingController> _logger;

        public BillingController(
            AppDbContext context,
            IWhatsAppClient whatsAppClient,
            IEmailSender emailSender,
            IInvoicePdfGenerator invoicePdfGenerator,
            IOptions<WhatsAppOptions> options,
            ILogger<BillingController> logger)
        {
            _context = context;
            _whatsAppClient = whatsAppClient;
            _emailSender = emailSender;
            _invoicePdfGenerator = invoicePdfGenerator;
            _options = options.Value;
            _logger = logger;
        }

        // GET: api/Billing
        [HttpGet]
        public async Task<IActionResult> GetBills(CancellationToken cancellationToken)
        {
            var invoices = await _context.Invoices
                .AsNoTracking()
                .Include(i => i.Customer)
                .OrderByDescending(x => x.Id)
                .Take(50)
                .Select(i => new
                {
                    i.Id,
                    i.Date,
                    CustomerName = i.Customer != null ? i.Customer.Name : "Aurum Valued Client",
                    i.GrandTotal
                })
                .ToListAsync(cancellationToken);
            return Ok(invoices);
        }

        // POST: api/Billing
        [HttpPost]
        public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceRequest model, CancellationToken cancellationToken)
        {
            if (model.Items.Count == 0)
                return BadRequest(new { message = "Please add at least one item." });

            var rate = await _context.GoldRates
                .AsNoTracking()
                .OrderByDescending(r => r.EffectiveAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (rate == null)
                return BadRequest(new { message = "Please set today's gold rate first." });

            var gstRate = model.GstRate is null ? 0.03m : Math.Clamp(model.GstRate.Value, 0m, 1m);

            Customer? customer = null;
            var custName = model.CustomerName?.Trim();
            var custEmail = model.CustomerEmail?.Trim();
            var custMobile = model.CustomerPhone?.Trim();

            if (!string.IsNullOrWhiteSpace(custName))
            {
                customer = await _context.Customers
                    .FirstOrDefaultAsync(c =>
                        (custMobile != null && c.Mobile == custMobile) ||
                        (custEmail != null && c.Email == custEmail),
                        cancellationToken);

                if (customer == null)
                {
                    customer = new Customer
                    {
                        Name = custName,
                        Email = string.IsNullOrWhiteSpace(custEmail) ? null : custEmail,
                        Mobile = string.IsNullOrWhiteSpace(custMobile) ? null : custMobile
                    };
                    _context.Customers.Add(customer);
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }

            var invoice = new Invoice
            {
                Date = DateTime.UtcNow,
                CustomerId = customer?.Id,
                GoldRateId = rate.Id,
                GstRate = gstRate
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync(cancellationToken);

            decimal invoiceSubtotal = 0m;
            decimal invoiceGst = 0m;

            foreach (var reqItem in model.Items)
            {
                var tagNo = (reqItem.TagNo ?? string.Empty).Trim();
                if (tagNo.Length == 0) continue;

                var stock = await _context.StockTags
                    .FirstOrDefaultAsync(s => s.TagNo == tagNo, cancellationToken);

                if (stock == null)
                    return BadRequest(new { message = $"Tag not found: {tagNo}" });

                if (stock.Status != StockStatus.Available || stock.Quantity <= 0)
                    return BadRequest(new { message = $"Tag not available or out of stock: {tagNo}" });

                if (stock.NetWeightG <= 0)
                    stock.NetWeightG = Math.Max(0, stock.GrossWeightG - stock.StoneWeightG);

                var ratePerGram = stock.PurityKarat switch
                {
                    24 => rate.Rate24KPerGram,
                    22 => rate.Rate22KPerGram,
                    18 => rate.Rate18KPerGram,
                    _ => rate.Rate22KPerGram
                };

                var wastageG = stock.WastageType switch
                {
                    WastageType.Grams => stock.WastageValue,
                    _ => stock.NetWeightG * stock.WastageValue / 100m
                };

                var chargeableWeight = stock.NetWeightG + Math.Max(0, wastageG);
                var metalValue = chargeableWeight * ratePerGram;

                var makingCharge = stock.MakingChargeType switch
                {
                    MakingChargeType.Fixed => stock.MakingChargeRate,
                    _ => stock.MakingChargeRate * stock.NetWeightG
                };

                var lineSubtotal = metalValue + makingCharge + stock.StoneAmount;
                var lineGst = lineSubtotal * gstRate;
                var lineTotal = lineSubtotal + lineGst;

                invoiceSubtotal += lineSubtotal;
                invoiceGst += lineGst;

                var line = new Billing_System.Models.InvoiceLine
                {
                    InvoiceId = invoice.Id,
                    StockTagId = stock.Id,
                    Description = stock.ItemName,
                    PurityKarat = stock.PurityKarat,
                    GrossWeightG = stock.GrossWeightG,
                    StoneWeightG = stock.StoneWeightG,
                    NetWeightG = stock.NetWeightG,
                    RatePerGramUsed = ratePerGram,
                    WastageG = wastageG,
                    MakingCharge = makingCharge,
                    StoneAmount = stock.StoneAmount,
                    MetalValue = metalValue,
                    LineSubtotal = lineSubtotal,
                    GstAmount = lineGst,
                    LineTotal = lineTotal
                };

                _context.InvoiceLines.Add(line);

                stock.Quantity -= 1;
                if (stock.Quantity <= 0)
                {
                    stock.Quantity = 0;
                    stock.Status = StockStatus.Sold;
                }
            }

            decimal exchangeTotal = 0m;
            if (model.ExchangeLines != null)
            {
                foreach (var ex in model.ExchangeLines)
                {
                    var ratePerGram = ex.PurityKarat switch
                    {
                        24 => rate.Buyback24KPerGram ?? rate.Rate24KPerGram,
                        22 => rate.Buyback22KPerGram ?? rate.Rate22KPerGram,
                        18 => rate.Buyback18KPerGram ?? rate.Rate18KPerGram,
                        _ => rate.Buyback22KPerGram ?? rate.Rate22KPerGram
                    };

                    var net = ex.NetWeightG > 0 ? ex.NetWeightG : Math.Max(0, ex.GrossWeightG);
                    var grossAmount = net * ratePerGram;
                    var amount = Math.Max(0m, grossAmount - Math.Max(0m, ex.DeductionAmount));

                    exchangeTotal += amount;

                    _context.ExchangeLines.Add(new ExchangeLine
                    {
                        InvoiceId = invoice.Id,
                        PurityKarat = ex.PurityKarat,
                        GrossWeightG = ex.GrossWeightG,
                        NetWeightG = net,
                        RatePerGramUsed = ratePerGram,
                        DeductionAmount = Math.Max(0m, ex.DeductionAmount),
                        Amount = amount
                    });
                }
            }

            invoice.Subtotal = invoiceSubtotal;
            invoice.GstAmount = invoiceGst;
            invoice.OldGoldDeduction = exchangeTotal;
            invoice.GrandTotal = invoiceSubtotal + invoiceGst - exchangeTotal;

            await _context.SaveChangesAsync(cancellationToken);

            // Fire-and-forget notification (don't block billing if WhatsApp fails)
            if (_options.Enabled)
            {
                String? rawPhone = model.CustomerPhone?.Trim();
                if (!string.IsNullOrWhiteSpace(rawPhone))
                {
                    String to = rawPhone.StartsWith("+") ? rawPhone[1..] : rawPhone;
                    String customerDisplayName = string.IsNullOrWhiteSpace(model.CustomerName) ? "Customer" : model.CustomerName.Trim();
                    String msg = $"Hi {customerDisplayName}, your invoice #{invoice.Id} has been generated. Total: ₹{invoice.GrandTotal.ToString("0.##")}.";

                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await _whatsAppClient.SendTextAsync(to, msg);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "WhatsApp send failed for invoice {InvoiceId}", invoice.Id);
                        }
                    });
                }
            }

            // Fire-and-forget email receipt (don't block billing if email fails)
            String? email = model.CustomerEmail?.Trim();
            if (!string.IsNullOrWhiteSpace(email))
            {
                String customerDisplayName = string.IsNullOrWhiteSpace(model.CustomerName) ? "Customer" : model.CustomerName.Trim();
                String subject = $"Receipt - Invoice #{invoice.Id}";
                String body = EmailTemplateGenerator.GenerateInvoiceEmail(customerDisplayName, invoice.Id, invoice.GrandTotal, invoice.Date);
                try
                {
                    var lines = await _context.InvoiceLines
                        .AsNoTracking()
                        .Where(x => x.InvoiceId == invoice.Id)
                        .OrderBy(x => x.Id)
                        .Select(x => new Billing_System.Services.Invoices.InvoiceLine(
                            $"{x.Description} ({x.PurityKarat}K) Net {x.NetWeightG:0.###}g",
                            1,
                            x.LineSubtotal))
                        .ToListAsync(cancellationToken);

                    var invoiceData = new InvoiceData(
                        invoice.Id,
                        invoice.Date,
                        "Billing System",
                        string.IsNullOrWhiteSpace(model.CustomerName) ? null : model.CustomerName.Trim(),
                        lines,
                        invoice.GstRate);

                    var pdfBytes = _invoicePdfGenerator.Generate(invoiceData);
                    var attachments = new[]
                    {
                        new EmailAttachment($"Invoice-{invoice.Id}.pdf", pdfBytes, "application/pdf")
                    };

                    // Avoid fire-and-forget here because scoped services (DbContext, sender) can be disposed
                    // when the request ends, causing intermittent failures.
                    await _emailSender.SendAsync(email, subject, body, attachments, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Email send failed for invoice {InvoiceId}", invoice.Id);
                }
            }

            return Ok(new { invoiceId = invoice.Id });
        }

        // GET: api/Billing/Invoice/5
        [HttpGet("Invoice/{invoiceId}")]
        public async Task<IActionResult> GetInvoice(int invoiceId, CancellationToken cancellationToken)
        {
            var invoice = await _context.Invoices
                .AsNoTracking()
                .Include(i => i.Customer)
                .FirstOrDefaultAsync(i => i.Id == invoiceId, cancellationToken);

            if (invoice == null)
                return NotFound();

            var items = await _context.InvoiceLines
                .AsNoTracking()
                .Where(x => x.InvoiceId == invoiceId)
                .OrderBy(x => x.Id)
                .Select(x => new
                {
                    Description = x.Description,
                    x.PurityKarat,
                    x.GrossWeightG,
                    x.StoneWeightG,
                    x.NetWeightG,
                    x.RatePerGramUsed,
                    x.WastageG,
                    x.MakingCharge,
                    x.StoneAmount,
                    x.MetalValue,
                    Subtotal = x.LineSubtotal,
                    GstAmount = x.GstAmount,
                    Total = x.LineTotal
                })
                .ToListAsync(cancellationToken);

            var response = new
            {
                InvoiceId = invoice.Id,
                Date = invoice.Date,
                CustomerName = invoice.Customer?.Name,
                Items = items,
                Subtotal = invoice.Subtotal,
                GstRate = invoice.GstRate,
                GstAmount = invoice.GstAmount,
                OldGoldDeduction = invoice.OldGoldDeduction,
                GrandTotal = invoice.GrandTotal
            };

            return Ok(response);
        }

        // GET: api/Billing/Invoice/5/Pdf
        [HttpGet("Invoice/{invoiceId}/Pdf")]
        public async Task<IActionResult> DownloadInvoicePdf(int invoiceId, CancellationToken cancellationToken)
        {
            var invoice = await _context.Invoices
                .AsNoTracking()
                .Include(i => i.Customer)
                .FirstOrDefaultAsync(i => i.Id == invoiceId, cancellationToken);

            if (invoice == null)
                return NotFound();

            var lines = await _context.InvoiceLines
                .AsNoTracking()
                .Where(x => x.InvoiceId == invoiceId)
                .OrderBy(x => x.Id)
                .Select(x => new Billing_System.Services.Invoices.InvoiceLine(
                    $"{x.Description} ({x.PurityKarat}K) Net {x.NetWeightG:0.###}g",
                    1,
                    x.LineSubtotal))
                .ToListAsync(cancellationToken);

            var invoiceData = new InvoiceData(
                invoice.Id,
                invoice.Date,
                "Billing System",
                invoice.Customer?.Name,
                lines,
                invoice.GstRate);

            var pdfBytes = _invoicePdfGenerator.Generate(invoiceData);
            return File(pdfBytes, "application/pdf", $"Invoice-{invoice.Id}.pdf");
        }
    }
}

public sealed record CreateInvoiceRequest(
    List<CreateInvoiceItem> Items,
    string? CustomerPhone,
    string? CustomerName,
    string? CustomerEmail,
    decimal? GstRate,
    List<CreateExchangeLine>? ExchangeLines);

public sealed record CreateInvoiceItem(string TagNo);

public sealed record CreateExchangeLine(
    int PurityKarat,
    decimal GrossWeightG,
    decimal NetWeightG,
    decimal DeductionAmount);
