using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Pets.Domain.Entities;

namespace VetVik.Modules.Pets.Infrastructure.Persistence.Configurations;

public class AnimalSpeciesConfiguration : IEntityTypeConfiguration<AnimalSpecies>
{
    public void Configure(EntityTypeBuilder<AnimalSpecies> b)
    {
        b.ToTable("AnimalSpecies");
        b.HasKey(x => x.Id);

        b.Property(x => x.Name).IsRequired().HasMaxLength(100);
        b.Property(x => x.Description).HasMaxLength(500);

        b.HasIndex(x => x.Name).IsUnique();

        b.HasMany(x => x.Breeds)
         .WithOne(x => x.Species!)
         .HasForeignKey(x => x.SpeciesId)
         .OnDelete(DeleteBehavior.Restrict);
    }
}
