using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CipherDrop.Migrations
{
    /// <inheritdoc />
    public partial class SharedVautlItems2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SharedVaultItem_Team_TeamId",
                table: "SharedVaultItem");

            migrationBuilder.DropForeignKey(
                name: "FK_SharedVaultItem_User_UserId",
                table: "SharedVaultItem");

            migrationBuilder.DropForeignKey(
                name: "FK_SharedVaultItem_VaultItem_VaultItemId",
                table: "SharedVaultItem");

            migrationBuilder.AlterColumn<int>(
                name: "VaultItemId",
                table: "SharedVaultItem",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "SharedVaultItem",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "TeamId",
                table: "SharedVaultItem",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddForeignKey(
                name: "FK_SharedVaultItem_Team_TeamId",
                table: "SharedVaultItem",
                column: "TeamId",
                principalTable: "Team",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SharedVaultItem_User_UserId",
                table: "SharedVaultItem",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SharedVaultItem_VaultItem_VaultItemId",
                table: "SharedVaultItem",
                column: "VaultItemId",
                principalTable: "VaultItem",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SharedVaultItem_Team_TeamId",
                table: "SharedVaultItem");

            migrationBuilder.DropForeignKey(
                name: "FK_SharedVaultItem_User_UserId",
                table: "SharedVaultItem");

            migrationBuilder.DropForeignKey(
                name: "FK_SharedVaultItem_VaultItem_VaultItemId",
                table: "SharedVaultItem");

            migrationBuilder.AlterColumn<int>(
                name: "VaultItemId",
                table: "SharedVaultItem",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "SharedVaultItem",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TeamId",
                table: "SharedVaultItem",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SharedVaultItem_Team_TeamId",
                table: "SharedVaultItem",
                column: "TeamId",
                principalTable: "Team",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
    }
}
