using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CipherDrop.Migrations
{
    /// <inheritdoc />
    public partial class adminsettings3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "KeyEnd",
                table: "AdminSettings",
                type: "TEXT",
                maxLength: 16,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KeyEnd",
                table: "AdminSettings");
        }
    }
}
