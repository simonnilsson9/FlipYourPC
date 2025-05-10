using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipYourPC.Migrations
{
    /// <inheritdoc />
    public partial class RemovedTotalStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalStock",
                table: "Components");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TotalStock",
                table: "Components",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
