using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetVik.Modules.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class __CheckPending : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Snapshot sync migration: schema operations already exist
            // in previous migrations, this keeps EF model in sync.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op. See Up().
        }
    }
}
