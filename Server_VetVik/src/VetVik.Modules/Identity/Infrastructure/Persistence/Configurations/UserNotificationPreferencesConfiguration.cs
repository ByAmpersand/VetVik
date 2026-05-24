using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Identity.Domain.Entities;

namespace VetVik.Modules.Identity.Infrastructure.Persistence.Configurations;

public class UserNotificationPreferencesConfiguration : IEntityTypeConfiguration<UserNotificationPreferences>
{
    public void Configure(EntityTypeBuilder<UserNotificationPreferences> b)
    {
        b.ToTable("UserNotificationPreferences");
        b.HasKey(x => x.Id);

        b.Property(x => x.UserId).IsRequired().HasMaxLength(450);

        b.HasOne(x => x.User)
         .WithOne()
         .HasForeignKey<UserNotificationPreferences>(x => x.UserId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => x.UserId).IsUnique();
    }
}
