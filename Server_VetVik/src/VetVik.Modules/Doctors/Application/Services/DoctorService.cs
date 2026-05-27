using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Security;
using VetVik.BuildingBlocks.Time;
using VetVik.Modules.Doctors.Application.DTOs;
using VetVik.Modules.Doctors.Domain.Entities;
using VetVik.Modules.Identity.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Doctors.Application.Services;

internal sealed class DoctorService : IDoctorService
{
    private readonly VetVikDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IClock _clock;

    public DoctorService(VetVikDbContext db, UserManager<ApplicationUser> userManager, IClock clock)
    {
        _db = db; _userManager = userManager; _clock = clock;
    }

    public async Task<IReadOnlyList<DoctorResponse>> GetAllAsync(bool includeInactive, Guid? specializationId, CancellationToken ct)
    {
        var q = _db.DoctorProfiles.AsNoTracking()
            .Include(d => d.User)
            .Include(d => d.DoctorSpecializations)
            .ThenInclude(ds => ds.Specialization)
            .AsQueryable();

        if (!includeInactive) q = q.Where(d => d.IsActive);
        if (specializationId.HasValue)
            q = q.Where(d => _db.DoctorSpecializations
                .Any(ds => ds.DoctorId == d.Id && ds.SpecializationId == specializationId.Value));

        var list = await q.OrderBy(d => d.LastName).ThenBy(d => d.FirstName).ToListAsync(ct);
        return list.Select(d => ToResponse(d)).ToList();
    }

    public async Task<DoctorResponse> GetAsync(Guid id, CancellationToken ct) =>
        ToResponse(await LoadAsync(id, ct));

    public async Task<DoctorResponse> CreateAsync(CreateDoctorRequest r, CancellationToken ct)
    {
        if (await _userManager.FindByEmailAsync(r.Email) is not null)
            throw new ConflictException($"User with email '{r.Email}' already exists.");

        var user = new ApplicationUser
        {
            UserName = r.Email,
            Email = r.Email,
            EmailConfirmed = true,
            IsActive = true
        };
        var create = await _userManager.CreateAsync(user, r.Password);
        if (!create.Succeeded)
            throw new BusinessRuleException(string.Join("; ", create.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, Roles.Doctor);

        var profile = new DoctorProfile
        {
            UserId = user.Id,
            FirstName = r.FirstName,
            LastName = r.LastName,
            Bio = r.Bio,
            PhotoUrl = r.PhotoUrl,
            ExperienceYears = r.ExperienceYears,
            IsActive = r.IsActive
        };
        _db.DoctorProfiles.Add(profile);
        await _db.SaveChangesAsync(ct);

        if (r.SpecializationIds is { Count: > 0 })
        {
            foreach (var sid in r.SpecializationIds.Distinct())
            {
                if (!await _db.Specializations.AnyAsync(s => s.Id == sid, ct))
                    throw new NotFoundException("Specialization", sid);
                _db.DoctorSpecializations.Add(new DoctorSpecialization
                {
                    DoctorId = profile.Id,
                    SpecializationId = sid
                });
            }
            await _db.SaveChangesAsync(ct);
        }

        return await GetAsync(profile.Id, ct);
    }

    public async Task<DoctorResponse> UpdateAsync(Guid id, UpdateDoctorRequest r, CancellationToken ct)
    {
        var doctor = await LoadAsync(id, ct);
        doctor.FirstName = r.FirstName;
        doctor.LastName = r.LastName;
        doctor.Bio = r.Bio;
        doctor.PhotoUrl = r.PhotoUrl;
        doctor.ExperienceYears = r.ExperienceYears;
        doctor.IsActive = r.IsActive;
        doctor.UpdatedAt = _clock.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ToResponse(doctor);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var doctor = await LoadAsync(id, ct);
        var hasAppointments = await _db.Appointments.AnyAsync(a => a.DoctorId == id, ct);
        if (hasAppointments)
        {
            doctor.IsActive = false;
            doctor.UpdatedAt = _clock.UtcNow;
            await _db.SaveChangesAsync(ct);
            return;
        }
        _db.DoctorProfiles.Remove(doctor);
        if (doctor.User is not null) await _userManager.DeleteAsync(doctor.User);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<DoctorResponse> AssignSpecializationAsync(Guid doctorId, Guid specializationId, CancellationToken ct)
    {
        _ = await LoadAsync(doctorId, ct);
        if (!await _db.Specializations.AnyAsync(s => s.Id == specializationId, ct))
            throw new NotFoundException("Specialization", specializationId);

        var exists = await _db.DoctorSpecializations
            .AnyAsync(ds => ds.DoctorId == doctorId && ds.SpecializationId == specializationId, ct);
        if (!exists)
        {
            _db.DoctorSpecializations.Add(new DoctorSpecialization
            {
                DoctorId = doctorId,
                SpecializationId = specializationId
            });
            await _db.SaveChangesAsync(ct);
        }
        return await GetAsync(doctorId, ct);
    }

    public async Task<DoctorResponse> RemoveSpecializationAsync(Guid doctorId, Guid specializationId, CancellationToken ct)
    {
        var link = await _db.DoctorSpecializations
            .FirstOrDefaultAsync(ds => ds.DoctorId == doctorId && ds.SpecializationId == specializationId, ct);
        if (link is not null)
        {
            _db.DoctorSpecializations.Remove(link);
            await _db.SaveChangesAsync(ct);
        }
        return await GetAsync(doctorId, ct);
    }

    private async Task<DoctorProfile> LoadAsync(Guid id, CancellationToken ct) =>
        await _db.DoctorProfiles
            .Include(d => d.User)
            .Include(d => d.DoctorSpecializations)
            .ThenInclude(ds => ds.Specialization)
            .FirstOrDefaultAsync(d => d.Id == id, ct)
            ?? throw new NotFoundException("DoctorProfile", id);

    private static DoctorResponse ToResponse(DoctorProfile d)
    {
        var specs = d.DoctorSpecializations
            .Select(ds => new SpecializationResponse(
                ds.Specialization!.Id, ds.Specialization.Name, ds.Specialization.Description, ds.Specialization.IsActive))
            .ToList();

        return new DoctorResponse(
            d.Id, d.UserId, d.User?.Email ?? string.Empty,
            d.FirstName, d.LastName, d.Bio, d.PhotoUrl, d.ExperienceYears, d.IsActive, specs);
    }
}
