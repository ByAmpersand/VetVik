using VetVik.Modules.Identity.Application.DTOs;

namespace VetVik.Modules.Identity.Application.Services;

public interface IIdentityService
{
    Task<AuthResponse> RegisterOwnerAsync(RegisterOwnerRequest request, CancellationToken ct);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<CurrentUserResponse> GetCurrentUserAsync(string userId, CancellationToken ct);
    Task<CurrentUserResponse> UpdateCurrentUserProfileAsync(string userId, UpdateCurrentUserProfileRequest request, CancellationToken ct);
    Task ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken ct);
    Task<NotificationPreferencesResponse> GetNotificationPreferencesAsync(string userId, CancellationToken ct);
    Task<NotificationPreferencesResponse> UpdateNotificationPreferencesAsync(string userId, NotificationPreferencesRequest request, CancellationToken ct);
}
