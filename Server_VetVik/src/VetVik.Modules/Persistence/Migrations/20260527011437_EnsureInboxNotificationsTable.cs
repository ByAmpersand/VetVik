using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetVik.Modules.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnsureInboxNotificationsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
IF OBJECT_ID(N'[dbo].[UserInboxNotifications]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[UserInboxNotifications](
        [Id] uniqueidentifier NOT NULL,
        [UserId] nvarchar(450) NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Message] nvarchar(1000) NOT NULL,
        [Category] nvarchar(50) NOT NULL,
        [LinkPath] nvarchar(300) NULL,
        [RelatedEntityId] uniqueidentifier NULL,
        [IsRead] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_UserInboxNotifications] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserInboxNotifications_AspNetUsers_UserId]
            FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
    );
END
""");

            migrationBuilder.Sql("""
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserInboxNotifications_UserId_CreatedAt')
BEGIN
    CREATE INDEX [IX_UserInboxNotifications_UserId_CreatedAt]
    ON [dbo].[UserInboxNotifications]([UserId], [CreatedAt]);
END
""");

            migrationBuilder.Sql("""
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserInboxNotifications_UserId_IsRead_CreatedAt')
BEGIN
    CREATE INDEX [IX_UserInboxNotifications_UserId_IsRead_CreatedAt]
    ON [dbo].[UserInboxNotifications]([UserId], [IsRead], [CreatedAt]);
END
""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
IF OBJECT_ID(N'[dbo].[UserInboxNotifications]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[UserInboxNotifications];
END
""");
        }
    }
}
