using System.ComponentModel.DataAnnotations;

namespace Billing_System.Models;

public sealed class InvoiceLine
{
    public int Id { get; set; }

    public int InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public int? StockTagId { get; set; }
    public StockTag? StockTag { get; set; }

    [MaxLength(240)]
    public string Description { get; set; } = string.Empty;

    public int PurityKarat { get; set; }

    public decimal GrossWeightG { get; set; }
    public decimal StoneWeightG { get; set; }
    public decimal NetWeightG { get; set; }

    public decimal RatePerGramUsed { get; set; }

    public decimal WastageG { get; set; }
    public decimal MakingCharge { get; set; }
    public decimal StoneAmount { get; set; }

    public decimal MetalValue { get; set; }

    /// <summary>
    /// Before GST.
    /// </summary>
    public decimal LineSubtotal { get; set; }

    public decimal GstAmount { get; set; }

    public decimal LineTotal { get; set; }
}

