using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Pets.Domain.Entities;

namespace VetVik.Modules.Pets.Infrastructure.Persistence.Configurations;

public class BreedConfiguration : IEntityTypeConfiguration<Breed>
{
    public void Configure(EntityTypeBuilder<Breed> b)
    {
        b.ToTable("Breeds");
        b.HasKey(x => x.Id);

        b.Property(x => x.Name).IsRequired().HasMaxLength(100);

        b.HasIndex(x => new { x.SpeciesId, x.Name }).IsUnique();
    }
}
