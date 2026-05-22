using VetVik.Modules.Identity.Domain.Entities;

namespace VetVik.Modules.Doctors.Domain.Entities;

/// <summary>
/// Join entity between DoctorProfile and Specialization.
/// Composite PK is configured in <see cref="Infrastructure.Persistence.Configurations.DoctorSpecializationConfiguration"/>.
/// </summary>
public class DoctorSpecialization
{
    public Guid DoctorId { get; set; }
    public DoctorProfile? Doctor { get; set; }

    public Guid SpecializationId { get; set; }
    public Specialization? Specialization { get; set; }
}
