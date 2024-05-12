using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CipherDrop.Migrations
{
    /// <inheritdoc />
    public partial class GlobalSearch_option : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RefE2",
                table: "VaultItem",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RefE2",
                table: "VaultFolder",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RefE2",
                table: "Cipher",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AllowGlobalSearchAndLinking",
                table: "AdminSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RefE2",
                table: "VaultItem");

            migrationBuilder.DropColumn(
                name: "RefE2",
                table: "VaultFolder");

            migrationBuilder.DropColumn(
                name: "RefE2",
                table: "Cipher");

            migrationBuilder.DropColumn(
                name: "AllowGlobalSearchAndLinking",
                table: "AdminSettings");
        }
    }
}
