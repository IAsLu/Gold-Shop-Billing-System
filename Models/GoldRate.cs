using System.ComponentModel.DataAnnotations;

namespace Billing_System.Models;

public sealed class GoldRate
{
    public int Id { get; set; }

    /// <summary>
    /// The timestamp when this rate becomes effective.
    /// </summary>
    public DateTime EffectiveAt { get; set; } = DateTime.UtcNow;

    [Range(0, double.MaxValue)]
    public decimal Rate24KPerGram { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Rate22KPerGram { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Rate18KPerGram { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? SilverRatePerGram { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Buyback24KPerGram { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Buyback22KPerGram { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Buyback18KPerGram { get; set; }
}

