using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Doctors.Domain.Entities;

namespace VetVik.Modules.Doctors.Infrastructure.Persistence.Configurations;

public class DoctorSpecializationConfiguration : IEntityTypeConfiguration<DoctorSpecialization>
{
    public void Configure(EntityTypeBuilder<DoctorSpecialization> b)
    {
        b.ToTable("DoctorSpecializations");
        b.HasKey(x => new { x.DoctorId, x.SpecializationId });

        b.HasOne(x => x.Doctor)
         .WithMany(x => x.DoctorSpecializations)
         .HasForeignKey(x => x.DoctorId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.Specialization)
         .WithMany(x => x.DoctorSpecializations)
         .HasForeignKey(x => x.SpecializationId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => x.SpecializationId);
    }
}
