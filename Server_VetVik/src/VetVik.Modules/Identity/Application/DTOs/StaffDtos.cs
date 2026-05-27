namespace VetVik.Modules.Identity.Application.DTOs;

public sealed record StaffMemberResponse(
    string UserId,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    bool IsActive,
    bool IsProtected);

public sealed record CreateAdminRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName);

public sealed record CreateDoctorStaffRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Bio,
    int? ExperienceYears,
    IReadOnlyList<Guid>? SpecializationIds);

public sealed record ClientDirectoryResponse(
    Guid OwnerId,
    string UserId,
    string Email,
    string FirstName,
    string LastName,
    string? Phone,
    int PetsCount,
    DateTime? LastAppointmentAt);

public sealed record AdminInsightsResponse(
    int MonthlyVisits,
    int CompletedVisits,
    int CancelledVisits,
    int ActiveDoctors,
    IReadOnlyList<MonthlyTrendPoint> MonthlyTrend,
    IReadOnlyList<WeeklyWorkloadPoint> WeeklyWorkload,
    IReadOnlyList<ServiceDistributionPoint> ServiceDistribution,
    IReadOnlyList<SpeciesDistributionPoint> SpeciesDistribution);

public sealed record MonthlyTrendPoint(string Month, int Appointments, int Completed);
public sealed record WeeklyWorkloadPoint(string Day, int Appointments);
public sealed record ServiceDistributionPoint(string Name, int Value);
public sealed record SpeciesDistributionPoint(string Name, int Value);
