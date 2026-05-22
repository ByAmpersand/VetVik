using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Doctors.Application.DTOs;
using VetVik.Modules.Doctors.Application.Services;
using VetVik.Modules.Identity.Application.DTOs;
using VetVik.Modules.Identity.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Identity.Application.Services;

internal sealed class StaffService : IStaffService
{
    private readonly VetVikDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IDoctorService _doctorService;
    private readonly SeedSettings _seed;

    public StaffService(
        VetVikDbContext db,
        UserManager<ApplicationUser> userManager,
        IDoctorService doctorService,
        IOptions<SeedSettings> seed)
    {
        _db = db;
        _userManager = userManager;
        _doctorService = doctorService;
        _seed = seed.Value;
    }

    public async Task<IReadOnlyList<StaffMemberResponse>> GetAllAsync(CancellationToken ct)
    {
        var result = new List<StaffMemberResponse>();

        var superAdminUser = await FindUserByEmailAsync(_seed.SuperAdmin.Email, ct);
        if (superAdminUser is not null)
        {
            var adminProfile = await _db.AdminProfiles.AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == superAdminUser.Id, ct);
            result.Add(ToStaff(superAdminUser, Roles.SuperAdmin,
                adminProfile?.FirstName ?? _seed.SuperAdmin.FirstName,
                adminProfile?.LastName ?? _seed.SuperAdmin.LastName,
                isProtected: true));
        }

        var admins = await _db.AdminProfiles.AsNoTracking()
            .Include(a => a.User)
            .ToListAsync(ct);

        foreach (var admin in admins)
        {
            if (admin.User is null) continue;
            var roles = await _userManager.GetRolesAsync(admin.User);
            if (roles.Contains(Roles.SuperAdmin)) continue;
            if (!roles.Contains(Roles.Admin)) continue;
            result.Add(ToStaff(admin.User, Roles.Admin, admin.FirstName, admin.LastName));
        }

        var doctors = await _db.DoctorProfiles.AsNoTracking()
            .Include(d => d.User)
            .ToListAsync(ct);

        foreach (var doctor in doctors)
        {
            if (doctor.User is null) continue;
            result.Add(ToStaff(doctor.User, Roles.Doctor, doctor.FirstName, doctor.LastName));
        }

        return result.OrderBy(s => s.Role).ThenBy(s => s.LastName).ToList();
    }

    public async Task<StaffMemberResponse> CreateAdminAsync(CreateAdminRequest request, CancellationToken ct)
    {
        if (await _userManager.FindByEmailAsync(request.Email) is not null)
            throw new ConflictException($"User with email '{request.Email}' already exists.");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            IsActive = true
        };

        var create = await _userManager.CreateAsync(user, request.Password);
        if (!create.Succeeded)
            throw new BusinessRuleException(string.Join("; ", create.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, Roles.Admin);

        _db.AdminProfiles.Add(new AdminProfile
        {
            UserId = user.Id,
            FirstName = request.FirstName,
            LastName = request.LastName
        });
        await _db.SaveChangesAsync(ct);

        return ToStaff(user, Roles.Admin, request.FirstName, request.LastName);
    }

    public async Task<StaffMemberResponse> CreateDoctorAsync(CreateDoctorStaffRequest request, CancellationToken ct)
    {
        var doctor = await _doctorService.CreateAsync(new CreateDoctorRequest(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName,
            request.Bio,
            null,
            true,
            request.SpecializationIds), ct);

        var user = await _userManager.FindByIdAsync(doctor.UserId)
            ?? throw new NotFoundException("User", doctor.UserId);

        return ToStaff(user, Roles.Doctor, doctor.FirstName, doctor.LastName);
    }

    public async Task DeleteAsync(string userId, string actingUserId, CancellationToken ct)
    {
        if (userId == actingUserId)
            throw new BusinessRuleException("You cannot remove your own account.");

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        if (IsProtectedSuperAdmin(user))
            throw new ForbiddenException("The super admin account cannot be removed.");

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains(Roles.SuperAdmin))
            throw new ForbiddenException("The super admin account cannot be removed.");

        if (roles.Contains(Roles.Doctor))
        {
            var doctor = await _db.DoctorProfiles.FirstOrDefaultAsync(d => d.UserId == userId, ct);
            if (doctor is not null)
                await _doctorService.DeleteAsync(doctor.Id, ct);
            return;
        }

        if (roles.Contains(Roles.Admin))
        {
            var admin = await _db.AdminProfiles.FirstOrDefaultAsync(a => a.UserId == userId, ct);
            if (admin is not null)
                _db.AdminProfiles.Remove(admin);
        }

        user.IsActive = false;
        await _userManager.UpdateAsync(user);
        await _db.SaveChangesAsync(ct);
    }

    private bool IsProtectedSuperAdmin(ApplicationUser user) =>
        !string.IsNullOrWhiteSpace(_seed.SuperAdmin.Email) &&
        string.Equals(user.Email, _seed.SuperAdmin.Email, StringComparison.OrdinalIgnoreCase);

    private async Task<ApplicationUser?> FindUserByEmailAsync(string email, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
        return await _userManager.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email, ct);
    }

    private static StaffMemberResponse ToStaff(
        ApplicationUser user,
        string role,
        string firstName,
        string lastName,
        bool isProtected = false) =>
        new(user.Id, user.Email!, firstName, lastName, role, user.IsActive, isProtected);
}
