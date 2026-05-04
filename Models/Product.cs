using System.ComponentModel.DataAnnotations;

namespace Billing_System.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int Stock { get; set; }

        // Relative URL served from wwwroot (e.g. "/uploads/products/1_abcd.jpg")
        public string? ImageUrl { get; set; }
    }
}
