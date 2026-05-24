using VetVik.BuildingBlocks.Domain;

namespace VetVik.Modules.Identity.Domain.Entities;

public class UserNotificationPreferences : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public bool AppointmentReminders { get; set; } = true;
    public bool MedicalRecordUpdates { get; set; } = true;
    public bool ClinicAnnouncements { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
