using System.ComponentModel.DataAnnotations;

namespace Billing_System.Models;

public enum StockStatus
{
    Available = 0,
    Reserved = 1,
    Sold = 2
}

public enum MakingChargeType
{
    PerGram = 0,
    Fixed = 1
}

public enum WastageType
{
    Percent = 0,
    Grams = 1
}

public sealed class StockTag
{
    public int Id { get; set; }

    [Required]
    [MaxLength(40)]
    public string TagNo { get; set; } = string.Empty;

    [Required]
    [MaxLength(160)]
    public string ItemName { get; set; } = string.Empty;

    [MaxLength(80)]
    public string? Category { get; set; }

    [MaxLength(20)]
    public string? Hsn { get; set; }

    /// <summary>
    /// 24 / 22 / 18 etc.
    /// </summary>
    [Range(0, 30)]
    public int PurityKarat { get; set; } = 22;

    /// <summary>
    /// Total weight including stones.
    /// </summary>
    [Range(0, double.MaxValue)]
    public decimal GrossWeightG { get; set; }

    /// <summary>
    /// Weight of stones/beads to be excluded from gold weight.
    /// </summary>
    [Range(0, double.MaxValue)]
    public decimal StoneWeightG { get; set; }

    /// <summary>
    /// Gold weight = Gross - Stone.
    /// </summary>
    [Range(0, double.MaxValue)]
    public decimal NetWeightG { get; set; }

    public WastageType WastageType { get; set; } = WastageType.Percent;

    [Range(0, double.MaxValue)]
    public decimal WastageValue { get; set; } = 0m;

    public MakingChargeType MakingChargeType { get; set; } = MakingChargeType.PerGram;

    [Range(0, double.MaxValue)]
    public decimal MakingChargeRate { get; set; } = 0m;

    [Range(0, double.MaxValue)]
    public decimal StoneAmount { get; set; } = 0m;

    // Relative URL served from wwwroot (e.g. "/uploads/products/1_abcd.jpg")
    public string? ImageUrl { get; set; }

    [Range(0, 1000000)]
    public int Quantity { get; set; } = 1;

    public StockStatus Status { get; set; } = StockStatus.Available;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

