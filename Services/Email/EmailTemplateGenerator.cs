using System;

namespace Billing_System.Services.Email
{
    public static class EmailTemplateGenerator
    {
        public static string GenerateInvoiceEmail(string customerName, int billId, decimal amount, DateTime date)
        {
            return $@"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Invoice - #{billId}</title>
</head>
<body style=""margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#334155;"">
    <table align=""center"" width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);margin-top:40px;margin-bottom:40px;"">
        <tr>
            <td style=""background:linear-gradient(135deg,#6366f1,#a855f7);padding:40px;text-align:center;color:#ffffff;"">
                <h1 style=""margin:0;font-size:28px;font-weight:800;letter-spacing:-0.025em;"">ABC Textiles</h1>
            </td>
        </tr>
        <tr>
            <td style=""padding:40px;"">
                <p style=""font-size:18px;font-weight:600;color:#1e293b;margin-bottom:16px;"">Hello, {customerName}!</p>
                <p style=""margin:0 0 24px 0;line-height:1.6;"">Thank you for your business. Your invoice has been generated and is ready for your records.</p>
                <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""border-collapse:collapse;background:#f1f5f9;border-radius:16px;"">
                    <tr>
                        <td style=""padding:20px;color:#64748b;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;"">Invoice Number</td>
                        <td align=""right"" style=""padding:20px;color:#1e293b;font-weight:700;"">#{billId}</td>
                    </tr>
                    <tr>
                        <td style=""padding:0 20px 20px 20px;color:#64748b;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;"">Date</td>
                        <td align=""right"" style=""padding:0 20px 20px 20px;color:#1e293b;font-weight:700;"">{date:MMM dd, yyyy}</td>
                    </tr>
                    <tr>
                        <td style=""padding:0 20px 20px 20px;color:#64748b;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;"">Total Amount</td>
                        <td align=""right"" style=""padding:0 20px 20px 20px;color:#6366f1;font-size:24px;font-weight:700;"">₹{amount:N2}</td>
                    </tr>
                </table>
                <p style=""margin-top:24px;line-height:1.6;"">We've attached a detailed PDF version of your invoice to your email for your convenience.</p>
            </td>
        </tr>
        <tr>
            <td style=""padding:32px;text-align:center;font-size:14px;color:#94a3b8;background:#fafafa;"">
                <p style=""margin:0;"">&copy; {DateTime.Now.Year} Billing System Inc. All rights reserved.</p>
                <p style=""margin:0;margin-top:4px;"">NextGen Textile Management Solutions</p>
            </td>
        </tr>
    </table>
</body>
</html>";
        }
    }
}