using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Identity.Domain.Entities;

namespace VetVik.Modules.Identity.Infrastructure.Persistence.Configurations;

public class UserInboxNotificationConfiguration : IEntityTypeConfiguration<UserInboxNotification>
{
    public void Configure(EntityTypeBuilder<UserInboxNotification> b)
    {
        b.ToTable("UserInboxNotifications");
        b.HasKey(x => x.Id);

        b.Property(x => x.UserId).IsRequired().HasMaxLength(450);
        b.Property(x => x.Title).IsRequired().HasMaxLength(200);
        b.Property(x => x.Message).IsRequired().HasMaxLength(1000);
        b.Property(x => x.Category).IsRequired().HasMaxLength(50);
        b.Property(x => x.LinkPath).HasMaxLength(300);

        b.HasIndex(x => new { x.UserId, x.IsRead, x.CreatedAt });
        b.HasIndex(x => new { x.UserId, x.CreatedAt });

        b.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
