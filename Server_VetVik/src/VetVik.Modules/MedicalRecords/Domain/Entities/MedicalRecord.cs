using VetVik.BuildingBlocks.Domain;
using VetVik.Modules.Appointments.Domain.Entities;
using VetVik.Modules.Identity.Domain.Entities;
using VetVik.Modules.Pets.Domain.Entities;

namespace VetVik.Modules.MedicalRecords.Domain.Entities;

public class MedicalRecord : BaseEntity, IAuditableEntity
{
    public Guid AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }

    public Guid PetId { get; set; }
    public Pet? Pet { get; set; }

    public Guid DoctorId { get; set; }
    public DoctorProfile? Doctor { get; set; }

    public string? Symptoms { get; set; }
    public string? Diagnosis { get; set; }
    public string? Treatment { get; set; }
    public string? Recommendations { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
