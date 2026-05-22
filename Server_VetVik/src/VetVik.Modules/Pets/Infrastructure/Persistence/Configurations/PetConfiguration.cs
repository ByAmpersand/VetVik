using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Pets.Domain.Entities;
using VetVik.Modules.Pets.Domain.Enums;

namespace VetVik.Modules.Pets.Infrastructure.Persistence.Configurations;

public class PetConfiguration : IEntityTypeConfiguration<Pet>
{
    public void Configure(EntityTypeBuilder<Pet> b)
    {
        b.ToTable("Pets");
        b.HasKey(x => x.Id);

        b.Property(x => x.Name).IsRequired().HasMaxLength(100);
        b.Property(x => x.Sex).HasConversion<int>();
        b.Property(x => x.Weight).HasColumnType("decimal(6,2)");
        b.Property(x => x.PhotoUrl).HasMaxLength(500);
        b.Property(x => x.Notes).HasMaxLength(1000);

        b.HasOne(x => x.Owner)
         .WithMany()
         .HasForeignKey(x => x.OwnerId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Species)
         .WithMany()
         .HasForeignKey(x => x.SpeciesId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Breed)
         .WithMany()
         .HasForeignKey(x => x.BreedId)
         .OnDelete(DeleteBehavior.SetNull);

        b.HasIndex(x => x.OwnerId);
        b.HasIndex(x => x.SpeciesId);
    }
}
