using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CipherDrop.Migrations
{
    /// <inheritdoc />
    public partial class SharedVautlItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SharedVaultItemView");

            migrationBuilder.CreateTable(
                name: "SharedVaultItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    VaultItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    TeamId = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedVaultItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SharedVaultItem_Team_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Team",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SharedVaultItem_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SharedVaultItem_VaultItem_VaultItemId",
                        column: x => x.VaultItemId,
                        principalTable: "VaultItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SharedVaultItem_TeamId",
                table: "SharedVaultItem",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedVaultItem_UserId",
                table: "SharedVaultItem",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedVaultItem_VaultItemId_UserId",
                table: "SharedVaultItem",
                columns: new[] { "VaultItemId", "UserId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SharedVaultItem");

            migrationBuilder.CreateTable(
                name: "SharedVaultItemView",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TeamId = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    VaultItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedVaultItemView", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SharedVaultItemView_Team_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Team",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SharedVaultItemView_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SharedVaultItemView_VaultItem_VaultItemId",
                        column: x => x.VaultItemId,
                        principalTable: "VaultItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SharedVaultItemView_TeamId",
                table: "SharedVaultItemView",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedVaultItemView_UserId",
                table: "SharedVaultItemView",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedVaultItemView_VaultItemId_UserId",
                table: "SharedVaultItemView",
                columns: new[] { "VaultItemId", "UserId" });
        }
    }
}
