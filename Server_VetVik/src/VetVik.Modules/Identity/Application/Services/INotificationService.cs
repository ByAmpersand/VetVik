using VetVik.Modules.Identity.Application.DTOs;

namespace VetVik.Modules.Identity.Application.Services;

public enum AppointmentNotificationKind
{
    Created,
    Confirmed,
    Rejected,
    Cancelled,
    Completed
}

public interface INotificationService
{
    Task<InboxNotificationsSummaryResponse> GetInboxAsync(string userId, int limit, CancellationToken ct);
    Task MarkAsReadAsync(string userId, Guid notificationId, CancellationToken ct);
    Task MarkAllAsReadAsync(string userId, CancellationToken ct);
    Task NotifyAppointmentEventAsync(
        Guid appointmentId,
        AppointmentNotificationKind kind,
        string? actorUserId,
        CancellationToken ct);
    Task NotifyMedicalRecordCreatedAsync(Guid appointmentId, CancellationToken ct);
}
