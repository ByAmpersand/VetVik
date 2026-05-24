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
        string? photoUrl = null;

        if (roles.Contains(Roles.Owner))
        {
            var p = await _db.OwnerProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == user.Id, ct);
            if (p is not null) { profileId = p.Id; first = p.FirstName; last = p.LastName; photoUrl = p.PhotoUrl; }
        }
        else if (roles.Contains(Roles.Doctor))
        {
            var p = await _db.DoctorProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == user.Id, ct);
            if (p is not null) { profileId = p.Id; first = p.FirstName; last = p.LastName; photoUrl = p.PhotoUrl; }
        }
        else if (roles.Contains(Roles.Admin) || roles.Contains(Roles.SuperAdmin))
        {
            var p = await _db.AdminProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == user.Id, ct);
            if (p is not null) { profileId = p.Id; first = p.FirstName; last = p.LastName; photoUrl = p.PhotoUrl; }
        }

        var preferences = await GetNotificationPreferencesAsync(user.Id, ct);
        return new CurrentUserResponse(user.Id, user.Email!, roles.ToArray(), profileId, first, last, photoUrl, preferences);
    }

    public async Task<CurrentUserResponse> UpdateCurrentUserProfileAsync(
        string userId,
        UpdateCurrentUserProfileRequest r,
        CancellationToken ct)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);
        var roles = await _userManager.GetRolesAsync(user);

        if (roles.Contains(Roles.Owner))
        {
            var profile = await _db.OwnerProfiles.FirstOrDefaultAsync(x => x.UserId == user.Id, ct)
                ?? throw new NotFoundException("OwnerProfile", user.Id);
            profile.FirstName = r.FirstName.Trim();
            profile.LastName = r.LastName.Trim();
            profile.PhotoUrl = NormalizeOptional(r.PhotoUrl);
            profile.UpdatedAt = _clock.UtcNow;
        }
        else if (roles.Contains(Roles.Doctor))
        {
            var profile = await _db.DoctorProfiles.FirstOrDefaultAsync(x => x.UserId == user.Id, ct)
                ?? throw new NotFoundException("DoctorProfile", user.Id);
            profile.FirstName = r.FirstName.Trim();
            profile.LastName = r.LastName.Trim();
            profile.PhotoUrl = NormalizeOptional(r.PhotoUrl);
            profile.UpdatedAt = _clock.UtcNow;
        }
        else if (roles.Contains(Roles.Admin) || roles.Contains(Roles.SuperAdmin))
        {
            var profile = await _db.AdminProfiles.FirstOrDefaultAsync(x => x.UserId == user.Id, ct)
                ?? throw new NotFoundException("AdminProfile", user.Id);
            profile.FirstName = r.FirstName.Trim();
            profile.LastName = r.LastName.Trim();
            profile.PhotoUrl = NormalizeOptional(r.PhotoUrl);
        }
        else
        {
            throw new ForbiddenException("The current user has no editable profile.");
        }

        await _db.SaveChangesAsync(ct);
        return await GetCurrentUserAsync(userId, ct);
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequest r, CancellationToken ct)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        var result = await _userManager.ChangePasswordAsync(user, r.CurrentPassword, r.NewPassword);
        if (!result.Succeeded)
            throw new BusinessRuleException(string.Join("; ", result.Errors.Select(e => e.Description)));
    }

    public async Task<NotificationPreferencesResponse> GetNotificationPreferencesAsync(string userId, CancellationToken ct)
    {
        var preferences = await EnsureNotificationPreferencesAsync(userId, ct);
        return ToNotificationPreferencesResponse(preferences);
    }

    public async Task<NotificationPreferencesResponse> UpdateNotificationPreferencesAsync(
        string userId,
        NotificationPreferencesRequest r,
        CancellationToken ct)
    {
        var preferences = await EnsureNotificationPreferencesAsync(userId, ct);
        preferences.AppointmentReminders = r.AppointmentReminders;
        preferences.MedicalRecordUpdates = r.MedicalRecordUpdates;
        preferences.ClinicAnnouncements = r.ClinicAnnouncements;
        preferences.UpdatedAt = _clock.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToNotificationPreferencesResponse(preferences);
    }

    private async Task<UserNotificationPreferences> EnsureNotificationPreferencesAsync(string userId, CancellationToken ct)
    {
        var preferences = await _db.UserNotificationPreferences.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (preferences is not null) return preferences;

        if (await _userManager.FindByIdAsync(userId) is null)
            throw new NotFoundException("User", userId);

        preferences = new UserNotificationPreferences
        {
            UserId = userId,
            AppointmentReminders = true,
            MedicalRecordUpdates = true,
            ClinicAnnouncements = true,
            CreatedAt = _clock.UtcNow
        };
        _db.UserNotificationPreferences.Add(preferences);
        await _db.SaveChangesAsync(ct);
        return preferences;
    }

    private static NotificationPreferencesResponse ToNotificationPreferencesResponse(UserNotificationPreferences p) =>
        new(p.AppointmentReminders, p.MedicalRecordUpdates, p.ClinicAnnouncements);

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private async Task<AuthResponse> IssueTokenAsync(ApplicationUser user, CancellationToken ct)
    {
        var roles = (await _userManager.GetRolesAsync(user)).ToArray();
        var token = _tokens.Generate(user.Id, user.Email!, roles);
        return new AuthResponse(token.AccessToken, token.ExpiresAtUtc, user.Id, user.Email!, roles);
    }
}
