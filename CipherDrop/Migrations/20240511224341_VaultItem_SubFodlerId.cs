using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CipherDrop.Migrations
{
    /// <inheritdoc />
    public partial class VaultItem_SubFodlerId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RootFolderId",
                table: "VaultItem",
                newName: "SubFolderId");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "SharedVaultItem",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SubFolderId",
                table: "VaultItem",
                newName: "RootFolderId");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "SharedVaultItem",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");
        }
    }
}
