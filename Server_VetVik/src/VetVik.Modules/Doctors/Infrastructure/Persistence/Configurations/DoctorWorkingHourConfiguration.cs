using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Doctors.Domain.Entities;

namespace VetVik.Modules.Doctors.Infrastructure.Persistence.Configurations;

public class DoctorWorkingHourConfiguration : IEntityTypeConfiguration<DoctorWorkingHour>
{
    public void Configure(EntityTypeBuilder<DoctorWorkingHour> b)
    {
        b.ToTable("DoctorWorkingHours");
        b.HasKey(x => x.Id);

        b.Property(x => x.DayOfWeek).HasConversion<int>();
        b.Property(x => x.StartTime).HasColumnType("time");
        b.Property(x => x.EndTime).HasColumnType("time");

        b.HasOne(x => x.Doctor)
         .WithMany()
         .HasForeignKey(x => x.DoctorId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => new { x.DoctorId, x.DayOfWeek });
    }
}
