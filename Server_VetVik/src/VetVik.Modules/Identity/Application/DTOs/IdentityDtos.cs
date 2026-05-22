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
    string? LastName);
