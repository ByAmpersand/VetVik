using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Security;
using VetVik.BuildingBlocks.Time;
using VetVik.Modules.Identity.Application.DTOs;
using VetVik.Modules.Identity.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Identity.Application.Services;

internal sealed class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtTokenGenerator _tokens;
    private readonly VetVikDbContext _db;
    private readonly IClock _clock;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtTokenGenerator tokens,
        VetVikDbContext db,
        IClock clock)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokens = tokens;
        _db = db;
        _clock = clock;
    }

    public async Task<AuthResponse> RegisterOwnerAsync(RegisterOwnerRequest r, CancellationToken ct)
    {
        if (await _userManager.FindByEmailAsync(r.Email) is not null)
            throw new ConflictException($"User with email '{r.Email}' already exists.");

        var user = new ApplicationUser
        {
            UserName = r.Email,
            Email = r.Email,
            EmailConfirmed = false,
            IsActive = true
        };

        var create = await _userManager.CreateAsync(user, r.Password);
        if (!create.Succeeded)
            throw new BusinessRuleException(string.Join("; ", create.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, Roles.Owner);

        var profile = new OwnerProfile
        {
            UserId = user.Id,
            FirstName = r.FirstName,
            LastName = r.LastName,
            Address = r.Address
        };
        _db.OwnerProfiles.Add(profile);
        await _db.SaveChangesAsync(ct);

        return await IssueTokenAsync(user, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest r, CancellationToken ct)
    {
        var user = await _userManager.FindByEmailAsync(r.Email)
            ?? throw new BusinessRuleException("Invalid email or password.");

        if (!user.IsActive)
            throw new ForbiddenException("Account is disabled.");

        var check = await _signInManager.CheckPasswordSignInAsync(user, r.Password, lockoutOnFailure: false);
        if (!check.Succeeded)
            throw new BusinessRuleException("Invalid email or password.");

        user.LastLoginAt = _clock.UtcNow;
        await _userManager.UpdateAsync(user);

        return await IssueTokenAsync(user, ct);
    }

    public async Task<CurrentUserResponse> GetCurrentUserAsync(string userId, CancellationToken ct)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        var roles = await _userManager.GetRolesAsync(user);

        Guid? profileId = null;
        string? first = null;
        string? last = null;

        if (roles.Contains(Roles.Owner))
        {
            var p = await _db.OwnerProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == user.Id, ct);
            if (p is not null) { profileId = p.Id; first = p.FirstName; last = p.LastName; }
        }
        else if (roles.Contains(Roles.Doctor))
        {
            var p = await _db.DoctorProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == user.Id, ct);
            if (p is not null) { profileId = p.Id; first = p.FirstName; last = p.LastName; }
        }
        else if (roles.Contains(Roles.Admin))
        {
            var p = await _db.AdminProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == user.Id, ct);
            if (p is not null) { profileId = p.Id; first = p.FirstName; last = p.LastName; }
        }

        return new CurrentUserResponse(user.Id, user.Email!, roles.ToArray(), profileId, first, last);
    }

    private async Task<AuthResponse> IssueTokenAsync(ApplicationUser user, CancellationToken ct)
    {
        var roles = (await _userManager.GetRolesAsync(user)).ToArray();
        var token = _tokens.Generate(user.Id, user.Email!, roles);
        return new AuthResponse(token.AccessToken, token.ExpiresAtUtc, user.Id, user.Email!, roles);
    }
}
