using VetVik.BuildingBlocks.Domain;

namespace VetVik.Modules.Clinic.Domain.Entities;

/// <summary>
/// Single-row table holding clinic-wide configuration.
/// Enforced as singleton by a filtered unique index in EF configuration.
/// </summary>
public class ClinicSettings : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Description { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public List<ClinicWorkingHour> WorkingHours { get; set; } = new();
}
