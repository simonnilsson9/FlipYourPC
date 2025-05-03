using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipYourPC.Migrations
{
    /// <inheritdoc />
    public partial class AddedInventory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "InventoryId",
                table: "Components",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Inventories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TotalValue = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Components_InventoryId",
                table: "Components",
                column: "InventoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Components_Inventories_InventoryId",
                table: "Components",
                column: "InventoryId",
                principalTable: "Inventories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Components_Inventories_InventoryId",
                table: "Components");

            migrationBuilder.DropTable(
                name: "Inventories");

            migrationBuilder.DropIndex(
                name: "IX_Components_InventoryId",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "InventoryId",
                table: "Components");
        }
    }
}
