using VetVik.BuildingBlocks.Domain;
using VetVik.Modules.Identity.Domain.Entities;

namespace VetVik.Modules.Doctors.Domain.Entities;

public class DoctorWorkingHour : BaseEntity, ISoftActivatable
{
    public Guid DoctorId { get; set; }
    public DoctorProfile? Doctor { get; set; }

    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public bool IsActive { get; set; } = true;
}
