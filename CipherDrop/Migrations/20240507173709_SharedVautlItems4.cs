using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CipherDrop.Migrations
{
    /// <inheritdoc />
    public partial class SharedVautlItems4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SharedVaultItem_VaultItem_VaultItemId",
                table: "SharedVaultItem");

            migrationBuilder.CreateIndex(
                name: "IX_SharedVaultItem_UserId",
                table: "SharedVaultItem",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SharedVaultItem_User_UserId",
                table: "SharedVaultItem",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SharedVaultItem_VaultItem_VaultItemId",
                table: "SharedVaultItem",
                column: "VaultItemId",
                principalTable: "VaultItem",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SharedVaultItem_User_UserId",
                table: "SharedVaultItem");

            migrationBuilder.DropForeignKey(
                name: "FK_SharedVaultItem_VaultItem_VaultItemId",
                table: "SharedVaultItem");

            migrationBuilder.DropIndex(
                name: "IX_SharedVaultItem_UserId",
                table: "SharedVaultItem");

            migrationBuilder.AddForeignKey(
                name: "FK_SharedVaultItem_VaultItem_VaultItemId",
                table: "SharedVaultItem",
                column: "VaultItemId",
                principalTable: "VaultItem",
                principalColumn: "Id");
        }
    }
}
