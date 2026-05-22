using VetVik.Modules.Identity.Application.DTOs;

namespace VetVik.Modules.Identity.Application.Services;

public interface IIdentityService
{
    Task<AuthResponse> RegisterOwnerAsync(RegisterOwnerRequest request, CancellationToken ct);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<CurrentUserResponse> GetCurrentUserAsync(string userId, CancellationToken ct);
}
