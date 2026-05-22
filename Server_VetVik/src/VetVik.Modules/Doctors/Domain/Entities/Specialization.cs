using VetVik.BuildingBlocks.Domain;

namespace VetVik.Modules.Doctors.Domain.Entities;

public class Specialization : BaseEntity, ISoftActivatable
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public List<DoctorSpecialization> DoctorSpecializations { get; set; } = new();
}
