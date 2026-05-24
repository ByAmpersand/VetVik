namespace VetVik.Modules.Identity.Application.DTOs;

public sealed record RegisterOwnerRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Address);

public sealed record LoginRequest(string Email, string Password);

public sealed record AuthResponse(
    string AccessToken,
    DateTime ExpiresAtUtc,
    string UserId,
    string Email,
    IReadOnlyList<string> Roles);

public sealed record CurrentUserResponse(
    string UserId,
    string Email,
    IReadOnlyList<string> Roles,
    Guid? ProfileId,
    string? FirstName,
    string? LastName,
    string? PhotoUrl,
    NotificationPreferencesResponse NotificationPreferences);

public sealed record UpdateCurrentUserProfileRequest(
    string FirstName,
    string LastName,
    string? PhotoUrl);

public sealed record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);

public sealed record NotificationPreferencesResponse(
    bool AppointmentReminders,
    bool MedicalRecordUpdates,
    bool ClinicAnnouncements);

public sealed record NotificationPreferencesRequest(
    bool AppointmentReminders,
    bool MedicalRecordUpdates,
    bool ClinicAnnouncements);
