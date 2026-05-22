namespace VetVik.Modules.Clinic.Application.DTOs;

public sealed record ClinicSettingsResponse(
    Guid Id,
    string Name,
    string Address,
    string PhoneNumber,
    string Email,
    string? Description,
    DateTime? UpdatedAt,
    IReadOnlyList<ClinicWorkingHourResponse> WorkingHours);

public sealed record ClinicWorkingHourResponse(
    Guid Id,
    DayOfWeek DayOfWeek,
    TimeOnly OpenTime,
    TimeOnly CloseTime,
    bool IsWorkingDay);

public sealed record UpdateClinicSettingsRequest(
    string Name,
    string Address,
    string PhoneNumber,
    string Email,
    string? Description);

public sealed record UpsertClinicWorkingHourRequest(
    DayOfWeek DayOfWeek,
    TimeOnly OpenTime,
    TimeOnly CloseTime,
    bool IsWorkingDay);

public sealed record RoomResponse(Guid Id, string Name, string? Description, bool IsActive);
public sealed record UpsertRoomRequest(string Name, string? Description, bool IsActive);
