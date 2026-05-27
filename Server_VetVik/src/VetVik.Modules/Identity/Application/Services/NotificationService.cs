using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Time;
using VetVik.Modules.Identity.Application.DTOs;
using VetVik.Modules.Identity.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Identity.Application.Services;

internal sealed class NotificationService : INotificationService
{
    private readonly VetVikDbContext _db;
    private readonly IClock _clock;

    public NotificationService(VetVikDbContext db, IClock clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<InboxNotificationsSummaryResponse> GetInboxAsync(string userId, int limit, CancellationToken ct)
    {
        limit = Math.Clamp(limit, 1, 50);

        var items = await _db.UserInboxNotifications.AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .Select(n => new InboxNotificationResponse(
                n.Id,
                n.Title,
                n.Message,
                n.Category,
                n.LinkPath,
                n.RelatedEntityId,
                n.IsRead,
                n.CreatedAt))
            .ToListAsync(ct);

        var unreadCount = await _db.UserInboxNotifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, ct);

        return new InboxNotificationsSummaryResponse(items, unreadCount);
    }

    public async Task MarkAsReadAsync(string userId, Guid notificationId, CancellationToken ct)
    {
        var notification = await _db.UserInboxNotifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, ct)
            ?? throw new NotFoundException("Notification", notificationId);

        if (notification.IsRead)
            return;

        notification.IsRead = true;
        await _db.SaveChangesAsync(ct);
    }

    public async Task MarkAllAsReadAsync(string userId, CancellationToken ct)
    {
        await _db.UserInboxNotifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(setters => setters.SetProperty(n => n.IsRead, true), ct);
    }

    public async Task NotifyAppointmentEventAsync(
        Guid appointmentId,
        AppointmentNotificationKind kind,
        string? actorUserId,
        CancellationToken ct)
    {
        var context = await LoadAppointmentContextAsync(appointmentId, ct);
        if (context is null)
            return;

        var slotLabel = $"{context.StartAt:MMM d, yyyy} at {context.StartAt:HH:mm}";
        var doctorName = $"Dr. {context.DoctorFirstName} {context.DoctorLastName}".Trim();

        switch (kind)
        {
            case AppointmentNotificationKind.Created:
                await CreateIfNotActorAsync(
                    context.DoctorUserId,
                    actorUserId,
                    "New appointment request",
                    $"{context.PetName} — {context.ServiceName} on {slotLabel}.",
                    "Appointment",
                    await ResolveAppointmentsLinkPathAsync(context.DoctorUserId, ct),
                    appointmentId,
                    ct);
                break;

            case AppointmentNotificationKind.Confirmed:
                await CreateIfNotActorAsync(
                    context.OwnerUserId,
                    actorUserId,
                    "Appointment confirmed",
                    $"Your visit for {context.PetName} on {slotLabel} was confirmed by {doctorName}.",
                    "Appointment",
                    await ResolveAppointmentsLinkPathAsync(context.OwnerUserId, ct),
                    appointmentId,
                    ct);
                break;

            case AppointmentNotificationKind.Rejected:
                await CreateIfNotActorAsync(
                    context.OwnerUserId,
                    actorUserId,
                    "Appointment declined",
                    $"Your request for {context.PetName} on {slotLabel} was declined.",
                    "Appointment",
                    await ResolveAppointmentsLinkPathAsync(context.OwnerUserId, ct),
                    appointmentId,
                    ct);
                break;

            case AppointmentNotificationKind.Cancelled:
                if (string.Equals(actorUserId, context.OwnerUserId, StringComparison.Ordinal))
                {
                    await CreateIfNotActorAsync(
                        context.DoctorUserId,
                        actorUserId,
                        "Appointment cancelled",
                        $"{context.PetName}'s appointment on {slotLabel} was cancelled by the owner.",
                        "Appointment",
                        await ResolveAppointmentsLinkPathAsync(context.DoctorUserId, ct),
                        appointmentId,
                        ct);
                }
                else
                {
                    await CreateIfNotActorAsync(
                        context.OwnerUserId,
                        actorUserId,
                        "Appointment cancelled",
                        $"Your appointment for {context.PetName} on {slotLabel} was cancelled.",
                        "Appointment",
                        await ResolveAppointmentsLinkPathAsync(context.OwnerUserId, ct),
                        appointmentId,
                        ct);
                }
                break;

            case AppointmentNotificationKind.Completed:
                await CreateIfNotActorAsync(
                    context.OwnerUserId,
                    actorUserId,
                    "Visit completed",
                    $"Your appointment for {context.PetName} on {slotLabel} has been marked as completed.",
                    "Appointment",
                    await ResolveAppointmentsLinkPathAsync(context.OwnerUserId, ct),
                    appointmentId,
                    ct);
                break;
        }
    }

    public async Task NotifyMedicalRecordCreatedAsync(Guid appointmentId, CancellationToken ct)
    {
        var context = await LoadAppointmentContextAsync(appointmentId, ct);
        if (context is null)
            return;

        var slotLabel = $"{context.StartAt:MMM d, yyyy} at {context.StartAt:HH:mm}";
        await CreateIfNotActorAsync(
            context.OwnerUserId,
            actorUserId: null,
            "Medical record added",
            $"A medical record was added for {context.PetName} from your visit on {slotLabel}.",
            "MedicalRecord",
            await ResolveMedicalHistoryLinkPathAsync(context.OwnerUserId, ct),
            appointmentId,
            ct);
    }

    private async Task CreateIfNotActorAsync(
        string recipientUserId,
        string? actorUserId,
        string title,
        string message,
        string category,
        string? linkPath,
        Guid relatedEntityId,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(recipientUserId))
            return;

        if (!string.IsNullOrEmpty(actorUserId)
            && string.Equals(recipientUserId, actorUserId, StringComparison.Ordinal))
            return;

        _db.UserInboxNotifications.Add(new UserInboxNotification
        {
            UserId = recipientUserId,
            Title = title,
            Message = message,
            Category = category,
            LinkPath = linkPath,
            RelatedEntityId = relatedEntityId,
            IsRead = false,
            CreatedAt = _clock.UtcNow
        });
        await _db.SaveChangesAsync(ct);
    }

    private async Task<AppointmentNotificationContext?> LoadAppointmentContextAsync(Guid appointmentId, CancellationToken ct)
    {
        return await (
            from appointment in _db.Appointments.AsNoTracking()
            join pet in _db.Pets.AsNoTracking() on appointment.PetId equals pet.Id
            join service in _db.Services.AsNoTracking() on appointment.ServiceId equals service.Id
            join doctor in _db.DoctorProfiles.AsNoTracking() on appointment.DoctorId equals doctor.Id
            join owner in _db.OwnerProfiles.AsNoTracking() on appointment.OwnerId equals owner.Id
            where appointment.Id == appointmentId
            select new AppointmentNotificationContext(
                appointment.StartAt,
                pet.Name,
                service.Name,
                doctor.FirstName,
                doctor.LastName,
                owner.UserId,
                doctor.UserId))
            .FirstOrDefaultAsync(ct);
    }

    private async Task<string> ResolveAppointmentsLinkPathAsync(string userId, CancellationToken ct)
    {
        if (await _db.OwnerProfiles.AsNoTracking().AnyAsync(o => o.UserId == userId, ct))
            return "/client/appointments";

        if (await _db.DoctorProfiles.AsNoTracking().AnyAsync(d => d.UserId == userId, ct))
            return "/doctor/appointments";

        return "/admin/appointments";
    }

    private async Task<string?> ResolveMedicalHistoryLinkPathAsync(string userId, CancellationToken ct)
    {
        if (await _db.OwnerProfiles.AsNoTracking().AnyAsync(o => o.UserId == userId, ct))
            return "/client/medical-history";

        return null;
    }

    private sealed record AppointmentNotificationContext(
        DateTime StartAt,
        string PetName,
        string ServiceName,
        string DoctorFirstName,
        string DoctorLastName,
        string OwnerUserId,
        string DoctorUserId);
}
