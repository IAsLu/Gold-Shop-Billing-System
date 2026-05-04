using System.ComponentModel.DataAnnotations;

namespace Billing_System.Models;

public sealed class Customer
{
    public int Id { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Mobile { get; set; }

    [MaxLength(240)]
    public string? Email { get; set; }

    [MaxLength(20)]
    public string? Pan { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

