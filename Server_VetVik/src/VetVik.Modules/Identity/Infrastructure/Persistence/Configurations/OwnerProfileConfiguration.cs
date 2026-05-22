using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Identity.Domain.Entities;

namespace VetVik.Modules.Identity.Infrastructure.Persistence.Configurations;

public class OwnerProfileConfiguration : IEntityTypeConfiguration<OwnerProfile>
{
    public void Configure(EntityTypeBuilder<OwnerProfile> b)
    {
        b.ToTable("OwnerProfiles");
        b.HasKey(x => x.Id);

        b.Property(x => x.UserId).IsRequired().HasMaxLength(450);
        b.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
        b.Property(x => x.LastName).IsRequired().HasMaxLength(100);
        b.Property(x => x.Address).HasMaxLength(300);

        b.HasOne(x => x.User)
         .WithOne()
         .HasForeignKey<OwnerProfile>(x => x.UserId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => x.UserId).IsUnique();
    }
}
