using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Clinic.Domain.Entities;

namespace VetVik.Modules.Clinic.Infrastructure.Persistence.Configurations;

public class ClinicSettingsConfiguration : IEntityTypeConfiguration<ClinicSettings>
{
    public void Configure(EntityTypeBuilder<ClinicSettings> b)
    {
        b.ToTable("ClinicSettings");
        b.HasKey(x => x.Id);

        b.Property(x => x.Name).IsRequired().HasMaxLength(200);
        b.Property(x => x.Address).IsRequired().HasMaxLength(300);
        b.Property(x => x.PhoneNumber).IsRequired().HasMaxLength(50);
        b.Property(x => x.Email).IsRequired().HasMaxLength(255);
        b.Property(x => x.Description).HasMaxLength(1000);

        b.HasMany(x => x.WorkingHours)
         .WithOne(x => x.ClinicSettings!)
         .HasForeignKey(x => x.ClinicSettingsId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
