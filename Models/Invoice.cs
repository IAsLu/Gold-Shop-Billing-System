namespace Billing_System.Models;

public sealed class Invoice
{
    public int Id { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public int GoldRateId { get; set; }
    public GoldRate? GoldRate { get; set; }

    /// <summary>
    /// Total of line subtotals (before GST).
    /// </summary>
    public decimal Subtotal { get; set; }

    public decimal GstRate { get; set; } = 0.03m;

    public decimal GstAmount { get; set; }

    /// <summary>
    /// Old-gold exchange deduction (if any).
    /// </summary>
    public decimal OldGoldDeduction { get; set; }

    public decimal GrandTotal { get; set; }

    public List<InvoiceLine> Lines { get; set; } = new();

    public List<ExchangeLine> ExchangeLines { get; set; } = new();
}

