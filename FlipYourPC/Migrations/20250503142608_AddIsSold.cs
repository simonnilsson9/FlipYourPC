using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipYourPC.Migrations
{
    /// <inheritdoc />
    public partial class AddIsSold : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSold",
                table: "PCs",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSold",
                table: "PCs");
        }
    }
}
