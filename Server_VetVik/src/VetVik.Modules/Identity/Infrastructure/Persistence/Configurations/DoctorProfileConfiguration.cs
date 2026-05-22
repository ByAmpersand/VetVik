using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Identity.Domain.Entities;

namespace VetVik.Modules.Identity.Infrastructure.Persistence.Configurations;

public class DoctorProfileConfiguration : IEntityTypeConfiguration<DoctorProfile>
{
    public void Configure(EntityTypeBuilder<DoctorProfile> b)
    {
        b.ToTable("DoctorProfiles");
        b.HasKey(x => x.Id);

        b.Property(x => x.UserId).IsRequired().HasMaxLength(450);
        b.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
        b.Property(x => x.LastName).IsRequired().HasMaxLength(100);
        b.Property(x => x.Bio).HasMaxLength(1000);
        b.Property(x => x.PhotoUrl).HasMaxLength(500);

        b.HasOne(x => x.User)
         .WithOne()
         .HasForeignKey<DoctorProfile>(x => x.UserId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => x.UserId).IsUnique();
        b.HasIndex(x => x.IsActive);
    }
}
