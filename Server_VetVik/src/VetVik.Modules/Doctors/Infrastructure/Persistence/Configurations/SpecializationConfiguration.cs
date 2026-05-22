using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Doctors.Domain.Entities;

namespace VetVik.Modules.Doctors.Infrastructure.Persistence.Configurations;

public class SpecializationConfiguration : IEntityTypeConfiguration<Specialization>
{
    public void Configure(EntityTypeBuilder<Specialization> b)
    {
        b.ToTable("Specializations");
        b.HasKey(x => x.Id);

        b.Property(x => x.Name).IsRequired().HasMaxLength(150);
        b.Property(x => x.Description).HasMaxLength(500);

        b.HasIndex(x => x.Name).IsUnique();
    }
}
