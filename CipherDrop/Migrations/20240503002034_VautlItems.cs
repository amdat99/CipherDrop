using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CipherDrop.Migrations
{
    /// <inheritdoc />
    public partial class VautlItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IsDefaltVaultItemViewRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDefaltVaultItemEditRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDefaltVaultItemDeleteRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDefaltVaultFolderViewRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDefaltVaultFolderEditRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDefaltVaultFolderDeleteRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
                    InviteOnly = table.Column<bool>(type: "INTEGER", nullable: false),
                    Require2FA = table.Column<bool>(type: "INTEGER", nullable: false),
                    RequireEmailVerification = table.Column<bool>(type: "INTEGER", nullable: false),
                    RequirePasswordChange = table.Column<bool>(type: "INTEGER", nullable: false),
                    RequirePasswordChangeDays = table.Column<string>(type: "TEXT", maxLength: 5, nullable: false),
                    RequirePasswordChangeOnFirstLogin = table.Column<bool>(type: "INTEGER", nullable: false),
                    AllowPublicSharing = table.Column<bool>(type: "INTEGER", nullable: false),
                    DisplayActivity = table.Column<bool>(type: "INTEGER", nullable: false),
                    Timezone = table.Column<string>(type: "TEXT", maxLength: 5, nullable: false),
                    EncyptionTestText = table.Column<string>(type: "TEXT", maxLength: 90, nullable: false),
                    KeyEnd = table.Column<string>(type: "TEXT", maxLength: 16, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PasswordReset",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Token = table.Column<string>(type: "TEXT", maxLength: 90, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasswordReset", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Session",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", maxLength: 90, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    IP = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Org = table.Column<string>(type: "TEXT", maxLength: 60, nullable: true),
                    Role = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    Active = table.Column<bool>(type: "INTEGER", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Session", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Team",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Team", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Password = table.Column<byte[]>(type: "BLOB", nullable: false),
                    PasswordSalt = table.Column<byte[]>(type: "BLOB", nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Avatar = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    VerificationToken = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    VerificationTokenExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    VerifiedAt = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserActivity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Area = table.Column<string>(type: "TEXT", maxLength: 15, nullable: false),
                    AreaId = table.Column<int>(type: "INTEGER", nullable: true),
                    StringAreaId = table.Column<string>(type: "TEXT", maxLength: 90, nullable: true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Action = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserActivity", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserInvite",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Token = table.Column<string>(type: "TEXT", maxLength: 90, nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    Org = table.Column<string>(type: "TEXT", maxLength: 60, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInvite", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Cipher",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Reference = table.Column<string>(type: "TEXT", maxLength: 60, nullable: true),
                    Value = table.Column<string>(type: "TEXT", maxLength: 5000, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 8, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    SelfDestruct = table.Column<bool>(type: "INTEGER", nullable: false),
                    Password = table.Column<byte[]>(type: "BLOB", nullable: true),
                    PasswordSalt = table.Column<byte[]>(type: "BLOB", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cipher", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cipher_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeamUser",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TeamId = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamUser", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeamUser_Team_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Team",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeamUser_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VaultFolder",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Reference = table.Column<string>(type: "TEXT", maxLength: 60, nullable: true),
                    IsRoot = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsViewRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsEditRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDeleteRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
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
                name: "SharedCipher",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CipherId = table.Column<string>(type: "TEXT", nullable: false),
                    TeamId = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedCipher", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SharedCipher_Cipher_CipherId",
                        column: x => x.CipherId,
                        principalTable: "Cipher",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SharedCipher_Team_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Team",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SharedCipher_User_UserId",
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
                    IsViewRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsEditRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDeleteRestricted = table.Column<bool>(type: "INTEGER", nullable: false),
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

            migrationBuilder.CreateTable(
                name: "SharedVaultItemView",
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
                name: "IX_Cipher_UserId",
                table: "Cipher",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordReset_Email",
                table: "PasswordReset",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_SharedCipher_CipherId_TeamId",
                table: "SharedCipher",
                columns: new[] { "CipherId", "TeamId" });

            migrationBuilder.CreateIndex(
                name: "IX_SharedCipher_TeamId",
                table: "SharedCipher",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedCipher_UserId",
                table: "SharedCipher",
                column: "UserId");

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

            migrationBuilder.CreateIndex(
                name: "IX_Team_Name",
                table: "Team",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TeamUser_TeamId_UserId",
                table: "TeamUser",
                columns: new[] { "TeamId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_TeamUser_UserId",
                table: "TeamUser",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_User_Email",
                table: "User",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserInvite_Email",
                table: "UserInvite",
                column: "Email");

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
                name: "AdminSettings");

            migrationBuilder.DropTable(
                name: "PasswordReset");

            migrationBuilder.DropTable(
                name: "Session");

            migrationBuilder.DropTable(
                name: "SharedCipher");

            migrationBuilder.DropTable(
                name: "SharedVaultItemView");

            migrationBuilder.DropTable(
                name: "TeamUser");

            migrationBuilder.DropTable(
                name: "UserActivity");

            migrationBuilder.DropTable(
                name: "UserInvite");

            migrationBuilder.DropTable(
                name: "Cipher");

            migrationBuilder.DropTable(
                name: "VaultItem");

            migrationBuilder.DropTable(
                name: "Team");

            migrationBuilder.DropTable(
                name: "VaultFolder");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
