namespace Billing_System.Models
{
    public class Bill
    {
        public int Id { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        public decimal TotalAmount { get; set; }
    }
}
