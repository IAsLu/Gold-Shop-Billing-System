using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Billing_System.Migrations
{
    /// <inheritdoc />
    public partial class AddQuantityToStockTag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "StockTags",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "StockTags");
        }
    }
}
