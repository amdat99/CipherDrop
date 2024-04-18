using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CipherDrop.Migrations
{
    /// <inheritdoc />
    public partial class vaultfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VaultFolder",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Reference = table.Column<string>(type: "TEXT", maxLength: 60, nullable: true),
                    IsRoot = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VaultFolder", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VaultFolder_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VaultItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    FolderId = table.Column<int>(type: "INTEGER", nullable: true),
                    Reference = table.Column<string>(type: "TEXT", maxLength: 60, nullable: true),
                    Value = table.Column<string>(type: "TEXT", maxLength: 20000, nullable: false),
                    IsFolder = table.Column<bool>(type: "INTEGER", nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 8, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VaultItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VaultItem_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VaultItem_VaultFolder_FolderId",
                        column: x => x.FolderId,
                        principalTable: "VaultFolder",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VaultFolder_UserId",
                table: "VaultFolder",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_VaultItem_FolderId",
                table: "VaultItem",
                column: "FolderId");

            migrationBuilder.CreateIndex(
                name: "IX_VaultItem_UserId",
                table: "VaultItem",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VaultItem");

            migrationBuilder.DropTable(
                name: "VaultFolder");
        }
    }
}
