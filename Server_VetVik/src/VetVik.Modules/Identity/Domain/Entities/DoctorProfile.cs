using VetVik.BuildingBlocks.Domain;
using VetVik.Modules.Doctors.Domain.Entities;

namespace VetVik.Modules.Identity.Domain.Entities;

public class DoctorProfile : BaseEntity, IAuditableEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? PhotoUrl { get; set; }
    public int? ExperienceYears { get; set; }
    public bool IsActive { get; set; } = true;

    public List<DoctorSpecialization> DoctorSpecializations { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
