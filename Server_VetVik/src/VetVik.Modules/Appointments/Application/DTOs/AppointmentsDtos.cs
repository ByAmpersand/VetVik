using VetVik.Modules.Appointments.Domain.Enums;

namespace VetVik.Modules.Appointments.Application.DTOs;

public sealed record AppointmentResponse(
    Guid Id,
    Guid OwnerId,
    string OwnerFullName,
    Guid PetId,
    string PetName,
    string PetSpecies,
    Guid DoctorId,
    string DoctorFullName,
    Guid RoomId,
    string RoomName,
    Guid ServiceId,
    string ServiceName,
    int ServiceDurationMinutes,
    DateTime StartAt,
    DateTime EndAt,
    AppointmentStatus Status,
    string? Reason,
    string? Notes,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    DateTime? CancelledAt,
    string? CancellationReason);

/// <summary>
/// EndAt is optional — when omitted it is derived from the selected service's duration.
/// </summary>
public sealed record CreateAppointmentRequest(
    Guid PetId,
    Guid DoctorId,
    Guid? RoomId,
    Guid ServiceId,
    DateTime StartAt,
    DateTime? EndAt,
    string? Reason,
    string? Notes,
    // Admin/Doctor only — when null, taken from the pet's owner.
    Guid? OwnerId);

public sealed record UpdateAppointmentRequest(
    Guid PetId,
    Guid DoctorId,
    Guid RoomId,
    Guid ServiceId,
    DateTime StartAt,
    DateTime? EndAt,
    string? Reason,
    string? Notes);

public sealed record CancelAppointmentRequest(string? Reason);
