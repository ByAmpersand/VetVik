using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetVik.Modules.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorExperienceYears : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExperienceYears",
                table: "DoctorProfiles",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExperienceYears",
                table: "DoctorProfiles");
        }
    }
}
