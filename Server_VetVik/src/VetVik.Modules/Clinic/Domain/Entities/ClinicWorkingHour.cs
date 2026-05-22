using VetVik.BuildingBlocks.Domain;

namespace VetVik.Modules.Clinic.Domain.Entities;

public class ClinicWorkingHour : BaseEntity
{
    public Guid ClinicSettingsId { get; set; }
    public ClinicSettings? ClinicSettings { get; set; }

    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly OpenTime { get; set; }
    public TimeOnly CloseTime { get; set; }
    public bool IsWorkingDay { get; set; } = true;
}
