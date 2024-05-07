using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CipherDrop.Migrations
{
    /// <inheritdoc />
    public partial class SharedVautlItems3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SharedVaultItem_User_UserId",
                table: "SharedVaultItem");

            migrationBuilder.DropIndex(
                name: "IX_SharedVaultItem_UserId",
                table: "SharedVaultItem");

            migrationBuilder.AlterColumn<string>(
                name: "Reference",
                table: "VaultItem",
                type: "TEXT",
                maxLength: 60,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 60,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Reference",
                table: "VaultItem",
                type: "TEXT",
                maxLength: 60,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 60);

            migrationBuilder.CreateIndex(
                name: "IX_SharedVaultItem_UserId",
                table: "SharedVaultItem",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SharedVaultItem_User_UserId",
                table: "SharedVaultItem",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id");
        }
    }
}
