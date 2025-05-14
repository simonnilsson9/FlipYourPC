using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipYourPC.Migrations
{
    /// <inheritdoc />
    public partial class AddedStoreToComponent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Store",
                table: "Components",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Store",
                table: "Components");
        }
    }
}
