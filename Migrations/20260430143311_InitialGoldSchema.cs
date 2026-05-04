using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Billing_System.Migrations
{
    /// <inheritdoc />
    public partial class InitialGoldSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Mobile = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: true),
                    Pan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GoldRates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EffectiveAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Rate24KPerGram = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rate22KPerGram = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rate18KPerGram = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SilverRatePerGram = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Buyback24KPerGram = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Buyback22KPerGram = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Buyback18KPerGram = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoldRates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StockTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TagNo = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ItemName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    Hsn = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PurityKarat = table.Column<int>(type: "int", nullable: false),
                    GrossWeightG = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    StoneWeightG = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    NetWeightG = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    WastageType = table.Column<int>(type: "int", nullable: false),
                    WastageValue = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    MakingChargeType = table.Column<int>(type: "int", nullable: false),
                    MakingChargeRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StoneAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockTags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    GoldRateId = table.Column<int>(type: "int", nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstRate = table.Column<decimal>(type: "decimal(9,6)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OldGoldDeduction = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Invoices_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Invoices_GoldRates_GoldRateId",
                        column: x => x.GoldRateId,
                        principalTable: "GoldRates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExchangeLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    PurityKarat = table.Column<int>(type: "int", nullable: false),
                    GrossWeightG = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    NetWeightG = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    RatePerGramUsed = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DeductionAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExchangeLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExchangeLines_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    StockTagId = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: false),
                    PurityKarat = table.Column<int>(type: "int", nullable: false),
                    GrossWeightG = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    StoneWeightG = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    NetWeightG = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    RatePerGramUsed = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    WastageG = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    MakingCharge = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StoneAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MetalValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineSubtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvoiceLines_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvoiceLines_StockTags_StockTagId",
                        column: x => x.StockTagId,
                        principalTable: "StockTags",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeLines_InvoiceId",
                table: "ExchangeLines",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_GoldRates_EffectiveAt",
                table: "GoldRates",
                column: "EffectiveAt");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_InvoiceId",
                table: "InvoiceLines",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLines_StockTagId",
                table: "InvoiceLines",
                column: "StockTagId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_CustomerId",
                table: "Invoices",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_GoldRateId",
                table: "Invoices",
                column: "GoldRateId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTags_TagNo",
                table: "StockTags",
                column: "TagNo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExchangeLines");

            migrationBuilder.DropTable(
                name: "InvoiceLines");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "StockTags");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "GoldRates");
        }
    }
}
