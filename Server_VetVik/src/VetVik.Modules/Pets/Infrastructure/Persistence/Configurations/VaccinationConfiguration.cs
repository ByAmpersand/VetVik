using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Pets.Domain.Entities;

namespace VetVik.Modules.Pets.Infrastructure.Persistence.Configurations;

public class VaccinationConfiguration : IEntityTypeConfiguration<Vaccination>
{
    public void Configure(EntityTypeBuilder<Vaccination> b)
    {
        b.ToTable("Vaccinations");
        b.Property(v => v.VaccineName).HasMaxLength(200).IsRequired();
        b.HasOne(v => v.Pet).WithMany().HasForeignKey(v => v.PetId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(v => v.AdministeredByDoctor).WithMany().HasForeignKey(v => v.AdministeredByDoctorId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
