using Billing_System.Models;
using Microsoft.EntityFrameworkCore;

namespace Billing_System.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<GoldRate> GoldRates => Set<GoldRate>();
    public DbSet<StockTag> StockTags => Set<StockTag>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();
    public DbSet<ExchangeLine> ExchangeLines => Set<ExchangeLine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<StockTag>()
            .HasIndex(x => x.TagNo)
            .IsUnique();

        modelBuilder.Entity<GoldRate>()
            .HasIndex(x => x.EffectiveAt);

        modelBuilder.Entity<Invoice>()
            .HasMany(x => x.Lines)
            .WithOne(x => x.Invoice!)
            .HasForeignKey(x => x.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Invoice>()
            .HasMany(x => x.ExchangeLines)
            .WithOne(x => x.Invoice!)
            .HasForeignKey(x => x.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.GrossWeightG).HasColumnType("decimal(18,3)");
        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.StoneWeightG).HasColumnType("decimal(18,3)");
        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.NetWeightG).HasColumnType("decimal(18,3)");

        modelBuilder.Entity<StockTag>()
            .Property(x => x.GrossWeightG).HasColumnType("decimal(18,3)");
        modelBuilder.Entity<StockTag>()
            .Property(x => x.StoneWeightG).HasColumnType("decimal(18,3)");
        modelBuilder.Entity<StockTag>()
            .Property(x => x.NetWeightG).HasColumnType("decimal(18,3)");

        modelBuilder.Entity<GoldRate>()
            .Property(x => x.Rate24KPerGram).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<GoldRate>()
            .Property(x => x.Rate22KPerGram).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<GoldRate>()
            .Property(x => x.Rate18KPerGram).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<GoldRate>()
            .Property(x => x.SilverRatePerGram).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<GoldRate>()
            .Property(x => x.Buyback24KPerGram).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<GoldRate>()
            .Property(x => x.Buyback22KPerGram).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<GoldRate>()
            .Property(x => x.Buyback18KPerGram).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<StockTag>()
            .Property(x => x.WastageValue).HasColumnType("decimal(18,3)");
        modelBuilder.Entity<StockTag>()
            .Property(x => x.MakingChargeRate).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<StockTag>()
            .Property(x => x.StoneAmount).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Invoice>()
            .Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Invoice>()
            .Property(x => x.GstRate).HasColumnType("decimal(9,6)");
        modelBuilder.Entity<Invoice>()
            .Property(x => x.GstAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Invoice>()
            .Property(x => x.OldGoldDeduction).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Invoice>()
            .Property(x => x.GrandTotal).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.RatePerGramUsed).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.WastageG).HasColumnType("decimal(18,3)");
        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.MakingCharge).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.StoneAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.MetalValue).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.LineSubtotal).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.GstAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<InvoiceLine>()
            .Property(x => x.LineTotal).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<ExchangeLine>()
            .Property(x => x.GrossWeightG).HasColumnType("decimal(18,3)");
        modelBuilder.Entity<ExchangeLine>()
            .Property(x => x.NetWeightG).HasColumnType("decimal(18,3)");
        modelBuilder.Entity<ExchangeLine>()
            .Property(x => x.RatePerGramUsed).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<ExchangeLine>()
            .Property(x => x.DeductionAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<ExchangeLine>()
            .Property(x => x.Amount).HasColumnType("decimal(18,2)");
    }
}
