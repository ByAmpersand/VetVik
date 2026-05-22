using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Clinic.Domain.Entities;

namespace VetVik.Modules.Clinic.Infrastructure.Persistence.Configurations;

public class ClinicWorkingHourConfiguration : IEntityTypeConfiguration<ClinicWorkingHour>
{
    public void Configure(EntityTypeBuilder<ClinicWorkingHour> b)
    {
        b.ToTable("ClinicWorkingHours");
        b.HasKey(x => x.Id);

        b.Property(x => x.DayOfWeek).HasConversion<int>();
        b.Property(x => x.OpenTime).HasColumnType("time");
        b.Property(x => x.CloseTime).HasColumnType("time");

        b.HasIndex(x => new { x.ClinicSettingsId, x.DayOfWeek }).IsUnique();
    }
}
