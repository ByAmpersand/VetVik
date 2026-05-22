using VetVik.BuildingBlocks.Domain;
using VetVik.Modules.Appointments.Domain.Enums;
using VetVik.Modules.Clinic.Domain.Entities;
using VetVik.Modules.Identity.Domain.Entities;
using VetVik.Modules.Pets.Domain.Entities;
using ServiceEntity = VetVik.Modules.Services.Domain.Entities.Service;

namespace VetVik.Modules.Appointments.Domain.Entities;

public class Appointment : BaseEntity, IAuditableEntity
{
    public Guid OwnerId { get; set; }
    public OwnerProfile? Owner { get; set; }

    public Guid PetId { get; set; }
    public Pet? Pet { get; set; }

    public Guid DoctorId { get; set; }
    public DoctorProfile? Doctor { get; set; }

    public Guid RoomId { get; set; }
    public Room? Room { get; set; }

    public Guid ServiceId { get; set; }
    public ServiceEntity? Service { get; set; }

    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

    public string? Reason { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
}
