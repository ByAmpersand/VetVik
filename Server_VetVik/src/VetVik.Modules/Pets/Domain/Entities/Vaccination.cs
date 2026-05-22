using VetVik.BuildingBlocks.Domain;
using VetVik.Modules.Identity.Domain.Entities;

namespace VetVik.Modules.Pets.Domain.Entities;

public class Vaccination : BaseEntity, IAuditableEntity
{
    public Guid PetId { get; set; }
    public Pet? Pet { get; set; }

    public string VaccineName { get; set; } = string.Empty;
    public DateOnly AdministeredDate { get; set; }
    public DateOnly NextDueDate { get; set; }

    public Guid? AdministeredByDoctorId { get; set; }
    public DoctorProfile? AdministeredByDoctor { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
