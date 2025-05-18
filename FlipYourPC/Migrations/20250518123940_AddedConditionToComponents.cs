using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipYourPC.Migrations
{
    /// <inheritdoc />
    public partial class AddedConditionToComponents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Condition",
                table: "Components",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Condition",
                table: "Components");
        }
    }
}
