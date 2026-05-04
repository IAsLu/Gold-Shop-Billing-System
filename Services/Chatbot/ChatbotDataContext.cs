using Billing_System.Data;
using Microsoft.EntityFrameworkCore;

namespace Billing_System.Services.Chatbot;

public interface IChatbotDataContext
{
    Task<string> BuildContextAsync(string userMessage, CancellationToken cancellationToken);
    Task<string?> TryAnswerFromDbAsync(string userMessage, CancellationToken cancellationToken);
}

public class ChatbotDataContext : IChatbotDataContext
{
    private readonly AppDbContext _db;

    public ChatbotDataContext(AppDbContext db)
    {
        _db = db;
    }

    public async Task<string> BuildContextAsync(string userMessage, CancellationToken cancellationToken)
    {
        // Lightweight summary (small + safe to inject into prompt).
        var tagCount = await _db.StockTags.CountAsync(cancellationToken);
        var lowStock = await _db.StockTags
            .AsNoTracking()
            .Where(p => p.Status == Models.StockStatus.Available && p.NetWeightG < 2m)
            .OrderBy(p => p.NetWeightG)
            .Select(p => new { p.TagNo, p.ItemName, p.PurityKarat, p.NetWeightG })
            .Take(8)
            .ToListAsync(cancellationToken);

        var invoiceCount = await _db.Invoices.CountAsync(cancellationToken);
        var last7Days = DateTime.Today.AddDays(-7);
        var revenue7d = await _db.Invoices
            .AsNoTracking()
            .Where(b => b.Date >= last7Days)
            .SumAsync(b => (decimal?)b.GrandTotal, cancellationToken) ?? 0m;

        var latestBills = await _db.Invoices
            .AsNoTracking()
            .OrderByDescending(b => b.Date)
            .Take(5)
            .Select(b => new { b.Id, b.Date, b.GrandTotal })
            .ToListAsync(cancellationToken);

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("BUSINESS DATA SNAPSHOT (use this to answer accurately):");
        sb.AppendLine($"- Stock tags: {tagCount} total");
        sb.AppendLine($"- Invoices: {invoiceCount} total");
        sb.AppendLine($"- Revenue (last 7 days): {revenue7d:0.##}");

        if (lowStock.Count > 0)
        {
            sb.AppendLine("- Low net-weight available tags (< 2g):");
            foreach (var p in lowStock)
                sb.AppendLine($"  - {p.TagNo} | {p.ItemName} | {p.PurityKarat}K | net {p.NetWeightG:0.###}g");
        }
        else
        {
            sb.AppendLine("- Low net-weight available tags (< 2g): none");
        }

        sb.AppendLine("- Recent invoices:");
        foreach (var b in latestBills)
            sb.AppendLine($"  - #{b.Id} | {b.Date:yyyy-MM-dd} | total {b.GrandTotal:0.##}");

        sb.AppendLine();
        sb.AppendLine("INSTRUCTIONS:");
        sb.AppendLine("- If user asks for totals, use the snapshot values.");
        sb.AppendLine("- If user asks about a product stock/price and it's not listed, say you need the product name or it's not in low-stock list.");

        return sb.ToString();
    }

    public async Task<string?> TryAnswerFromDbAsync(string userMessage, CancellationToken cancellationToken)
    {
        // Simple “DB-only” assistant for common questions (works even without Gemini).
        var msg = (userMessage ?? string.Empty).Trim().ToLowerInvariant();
        if (msg.Length == 0) return null;

        if (msg.Contains("total revenue") || msg.Contains("revenue") || msg.Contains("sales last 7") || msg.Contains("last 7 days"))
        {
            var last7Days = DateTime.Today.AddDays(-7);
            var revenue7d = await _db.Invoices
                .AsNoTracking()
                .Where(b => b.Date >= last7Days)
                .SumAsync(b => (decimal?)b.GrandTotal, cancellationToken) ?? 0m;

            return $"Revenue for the last 7 days is {revenue7d:0.##}.";
        }

        if (msg.Contains("low stock") || msg.Contains("stock alert") || (msg.Contains("less than") && msg.Contains("stock")))
        {
            var lowStock = await _db.StockTags
                .AsNoTracking()
                .Where(p => p.Status == Models.StockStatus.Available && p.NetWeightG < 2m)
                .OrderBy(p => p.NetWeightG)
                .Take(10)
                .Select(p => new { p.TagNo, p.ItemName, p.NetWeightG })
                .ToListAsync(cancellationToken);

            if (lowStock.Count == 0) return "No low net-weight tags found (threshold: < 2g).";

            var lines = string.Join(", ", lowStock.Select(p => $"{p.TagNo} {p.ItemName} ({p.NetWeightG:0.###}g)"));
            return $"Low net-weight available tags (<2g): {lines}.";
        }

        if (msg.Contains("how many tag") || msg.Contains("stock count") || msg.Contains("inventory count"))
        {
            var count = await _db.StockTags.CountAsync(cancellationToken);
            return $"You have {count} stock tags in inventory.";
        }

        if (msg.StartsWith("rate ") || msg.Contains("gold rate") || msg.Contains("today rate"))
        {
            var latest = await _db.GoldRates.AsNoTracking()
                .OrderByDescending(r => r.EffectiveAt)
                .FirstOrDefaultAsync(cancellationToken);

            return latest == null
                ? "No gold rate is configured yet."
                : $"Latest rates (₹/g): 24K {latest.Rate24KPerGram:0.##}, 22K {latest.Rate22KPerGram:0.##}, 18K {latest.Rate18KPerGram:0.##}.";
        }

        return null;
    }
}

