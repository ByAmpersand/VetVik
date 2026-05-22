using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Services.Domain.Entities;

namespace VetVik.Modules.Services.Infrastructure.Persistence.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> b)
    {
        b.ToTable("Services");
        b.HasKey(x => x.Id);

        b.Property(x => x.Name).IsRequired().HasMaxLength(150);
        b.Property(x => x.Description).HasMaxLength(1000);
        b.Property(x => x.Price).HasColumnType("decimal(10,2)");

        b.HasOne(x => x.Category)
         .WithMany(x => x.Services)
         .HasForeignKey(x => x.CategoryId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasIndex(x => new { x.CategoryId, x.Name }).IsUnique();
    }
}
