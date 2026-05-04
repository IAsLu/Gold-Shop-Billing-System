namespace Billing_System.Services.Invoices;

public interface IInvoicePdfGenerator
{
    byte[] Generate(InvoiceData data);
}

