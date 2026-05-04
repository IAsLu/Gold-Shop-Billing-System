namespace Billing_System.ViewModels
{
    public class BillVM
    {
        public List<BillItemVM> Items { get; set; } = new();

        // Optional for notifications (WhatsApp/SMS). Use E.164 format, e.g. "919876543210"
        public string? CustomerPhone { get; set; }
        public string? CustomerName { get; set; }

        // Optional email receipt
        public string? CustomerEmail { get; set; }
    }
}
