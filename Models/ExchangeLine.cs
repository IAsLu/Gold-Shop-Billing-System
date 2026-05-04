namespace Billing_System.Models;

public sealed class ExchangeLine
{
    public int Id { get; set; }

    public int InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public int PurityKarat { get; set; }

    public decimal GrossWeightG { get; set; }
    public decimal NetWeightG { get; set; }

    public decimal RatePerGramUsed { get; set; }

    /// <summary>
    /// Any deductions (e.g. impurities/stone) applied by shop.
    /// </summary>
    public decimal DeductionAmount { get; set; }

    /// <summary>
    /// Final amount credited to the customer (reduces invoice).
    /// </summary>
    public decimal Amount { get; set; }
}

