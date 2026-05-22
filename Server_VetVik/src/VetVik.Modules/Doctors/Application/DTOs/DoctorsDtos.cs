namespace VetVik.Modules.Doctors.Application.DTOs;

public sealed record DoctorResponse(
    Guid Id,
    string UserId,
    string Email,
    string FirstName,
    string LastName,
    string? Bio,
    string? PhotoUrl,
    bool IsActive,
    IReadOnlyList<SpecializationResponse> Specializations);

public sealed record CreateDoctorRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Bio,
    string? PhotoUrl,
    bool IsActive,
    IReadOnlyList<Guid>? SpecializationIds);

public sealed record UpdateDoctorRequest(
    string FirstName,
    string LastName,
    string? Bio,
    string? PhotoUrl,
    bool IsActive);

public sealed record SpecializationResponse(Guid Id, string Name, string? Description, bool IsActive);
public sealed record UpsertSpecializationRequest(string Name, string? Description, bool IsActive);

public sealed record DoctorWorkingHourResponse(
    Guid Id, Guid DoctorId, DayOfWeek DayOfWeek, TimeOnly StartTime, TimeOnly EndTime, bool IsActive);

public sealed record UpsertDoctorWorkingHourRequest(
    DayOfWeek DayOfWeek, TimeOnly StartTime, TimeOnly EndTime, bool IsActive);
