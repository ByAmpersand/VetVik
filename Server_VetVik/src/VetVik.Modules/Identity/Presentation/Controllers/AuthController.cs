using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Identity.Application.DTOs;
using VetVik.Modules.Identity.Application.Services;

namespace VetVik.Modules.Identity.Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IIdentityService _identity;
    private readonly ICurrentUser _currentUser;

    public AuthController(IIdentityService identity, ICurrentUser currentUser)
    {
        _identity = identity;
        _currentUser = currentUser;
    }

    [HttpPost("register/owner")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    public Task<AuthResponse> RegisterOwner([FromBody] RegisterOwnerRequest request, CancellationToken ct) =>
        _identity.RegisterOwnerAsync(request, ct);

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    public Task<AuthResponse> Login([FromBody] LoginRequest request, CancellationToken ct) =>
        _identity.LoginAsync(request, ct);

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(CurrentUserResponse), StatusCodes.Status200OK)]
    public Task<CurrentUserResponse> Me(CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
            throw new ForbiddenException("Authentication required.");
        return _identity.GetCurrentUserAsync(_currentUser.UserId, ct);
    }
}
