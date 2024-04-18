using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CipherDrop.Migrations
{
    /// <inheritdoc />
    public partial class update2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ValidDescriptionTextString",
                table: "AdminSettings",
                type: "TEXT",
                maxLength: 90,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidDescriptionTextString",
                table: "AdminSettings");
        }
    }
}
