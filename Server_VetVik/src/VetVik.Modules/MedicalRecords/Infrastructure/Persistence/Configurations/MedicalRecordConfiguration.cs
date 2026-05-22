using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.MedicalRecords.Domain.Entities;

namespace VetVik.Modules.MedicalRecords.Infrastructure.Persistence.Configurations;

public class MedicalRecordConfiguration : IEntityTypeConfiguration<MedicalRecord>
{
    public void Configure(EntityTypeBuilder<MedicalRecord> b)
    {
        b.ToTable("MedicalRecords");
        b.HasKey(x => x.Id);

        b.Property(x => x.Symptoms).HasMaxLength(1000);
        b.Property(x => x.Diagnosis).HasMaxLength(1000);
        b.Property(x => x.Treatment).HasMaxLength(1000);
        b.Property(x => x.Recommendations).HasMaxLength(1000);

        b.HasOne(x => x.Appointment)
         .WithOne()
         .HasForeignKey<MedicalRecord>(x => x.AppointmentId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Pet)
         .WithMany()
         .HasForeignKey(x => x.PetId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Doctor)
         .WithMany()
         .HasForeignKey(x => x.DoctorId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasIndex(x => x.AppointmentId).IsUnique();
        b.HasIndex(x => x.PetId);
        b.HasIndex(x => x.DoctorId);
    }
}
