using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VetVik.Modules.Appointments.Domain.Entities;

namespace VetVik.Modules.Appointments.Infrastructure.Persistence.Configurations;

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> b)
    {
        b.ToTable("Appointments");
        b.HasKey(x => x.Id);

        b.Property(x => x.Status).HasConversion<int>();
        b.Property(x => x.Reason).HasMaxLength(500);
        b.Property(x => x.Notes).HasMaxLength(1000);
        b.Property(x => x.CancellationReason).HasMaxLength(500);

        b.HasOne(x => x.Owner)
         .WithMany()
         .HasForeignKey(x => x.OwnerId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Pet)
         .WithMany()
         .HasForeignKey(x => x.PetId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Doctor)
         .WithMany()
         .HasForeignKey(x => x.DoctorId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Room)
         .WithMany()
         .HasForeignKey(x => x.RoomId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Service)
         .WithMany()
         .HasForeignKey(x => x.ServiceId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasIndex(x => new { x.DoctorId, x.StartAt });
        b.HasIndex(x => new { x.RoomId, x.StartAt });
        b.HasIndex(x => new { x.OwnerId, x.StartAt });
        b.HasIndex(x => x.Status);
    }
}
