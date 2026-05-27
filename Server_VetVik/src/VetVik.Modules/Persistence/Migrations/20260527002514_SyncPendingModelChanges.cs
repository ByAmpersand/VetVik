using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetVik.Modules.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SyncPendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
IF OBJECT_ID(N'[UserInboxNotifications]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [UserInboxNotifications];
END
""");

            migrationBuilder.Sql("""
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE Name = N'ExperienceYears'
      AND Object_ID = OBJECT_ID(N'[AdminProfiles]')
)
BEGIN
    ALTER TABLE [AdminProfiles] DROP COLUMN [ExperienceYears];
END
""");

            migrationBuilder.Sql("""
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE Name = N'ExperienceYears'
      AND Object_ID = OBJECT_ID(N'[DoctorProfiles]')
)
BEGIN
    ALTER TABLE [DoctorProfiles] ADD [ExperienceYears] int NULL;
END
""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExperienceYears",
                table: "DoctorProfiles");

            migrationBuilder.AddColumn<int>(
                name: "ExperienceYears",
                table: "AdminProfiles",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "UserInboxNotifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    LinkPath = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    RelatedEntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInboxNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserInboxNotifications_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserInboxNotifications_UserId_CreatedAt",
                table: "UserInboxNotifications",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_UserInboxNotifications_UserId_IsRead_CreatedAt",
                table: "UserInboxNotifications",
                columns: new[] { "UserId", "IsRead", "CreatedAt" });
        }
    }
}
