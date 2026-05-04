namespace Billing_System.Services.Invoices;

public sealed record InvoiceLine(string Name, int Quantity, decimal UnitPrice)
{
    public decimal LineTotal => UnitPrice * Quantity;
}

public sealed record InvoiceData(
    int BillId,
    DateTime Date,
    string BusinessName,
    string? CustomerName,
    IReadOnlyList<InvoiceLine> Lines,
    decimal GstRate)
{
    public decimal Subtotal => Lines.Sum(x => x.LineTotal);
    public decimal GstAmount => Subtotal * GstRate;
    public decimal GrandTotal => Subtotal + GstAmount;
}

