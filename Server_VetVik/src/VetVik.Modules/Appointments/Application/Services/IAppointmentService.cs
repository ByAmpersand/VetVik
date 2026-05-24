using VetVik.Modules.Appointments.Application.DTOs;

namespace VetVik.Modules.Appointments.Application.Services;

public interface IAppointmentService
{
    Task<AppointmentResponse> GetAsync(Guid id, CancellationToken ct);

    Task<IReadOnlyList<AppointmentResponse>> GetByOwnerAsync(Guid ownerId, CancellationToken ct);
    Task<IReadOnlyList<AppointmentResponse>> GetForCurrentOwnerAsync(string userId, CancellationToken ct);
    Task<IReadOnlyList<AppointmentResponse>> GetByDoctorAsync(Guid doctorId, CancellationToken ct);
    Task<IReadOnlyList<AppointmentResponse>> GetForCurrentDoctorAsync(string userId, CancellationToken ct);

    Task<IReadOnlyList<AppointmentResponse>> GetByDateRangeAsync(
        DateTime from, DateTime to, Guid? doctorId, Guid? roomId, CancellationToken ct);

    Task<IReadOnlyList<AppointmentResponse>> GetCalendarAsync(DateTime from, DateTime to, CancellationToken ct);
    Task<IReadOnlyList<AvailableAppointmentSlotResponse>> FindAvailableSlotsAsync(
        FindAvailableAppointmentSlotsRequest request,
        CancellationToken ct);

    Task<AppointmentResponse> CreateAsync(CreateAppointmentRequest request, string? actingUserId, bool actingIsOwner, CancellationToken ct);
    Task<AppointmentResponse> UpdateAsync(Guid id, UpdateAppointmentRequest request, CancellationToken ct);
    Task<AppointmentResponse> CancelAsync(Guid id, CancelAppointmentRequest request, CancellationToken ct);
    Task<AppointmentResponse> ConfirmAsync(Guid id, CancellationToken ct);
    Task<AppointmentResponse> RejectAsync(Guid id, string? reason, CancellationToken ct);
    Task<AppointmentResponse> CompleteAsync(Guid id, CancellationToken ct);
}
