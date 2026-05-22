using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.Modules.Doctors.Application.DTOs;
using VetVik.Modules.Doctors.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Doctors.Application.Services;

internal sealed class DoctorWorkingHoursService : IDoctorWorkingHoursService
{
    private readonly VetVikDbContext _db;
    public DoctorWorkingHoursService(VetVikDbContext db) => _db = db;

    public async Task<IReadOnlyList<DoctorWorkingHourResponse>> GetForDoctorAsync(Guid doctorId, CancellationToken ct)
    {
        if (!await _db.DoctorProfiles.AnyAsync(d => d.Id == doctorId, ct))
            throw new NotFoundException("DoctorProfile", doctorId);

        return await _db.DoctorWorkingHours.AsNoTracking()
            .Where(w => w.DoctorId == doctorId)
            .OrderBy(w => w.DayOfWeek)
            .Select(w => new DoctorWorkingHourResponse(
                w.Id, w.DoctorId, w.DayOfWeek, w.StartTime, w.EndTime, w.IsActive))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<DoctorWorkingHourResponse>> ReplaceForDoctorAsync(
        Guid doctorId, IReadOnlyList<UpsertDoctorWorkingHourRequest> requests, CancellationToken ct)
    {
        if (!await _db.DoctorProfiles.AnyAsync(d => d.Id == doctorId, ct))
            throw new NotFoundException("DoctorProfile", doctorId);

        foreach (var r in requests)
            if (r.IsActive && r.EndTime <= r.StartTime)
                throw new BusinessRuleException($"End time must be after start time for {r.DayOfWeek}.");

        var existing = _db.DoctorWorkingHours.Where(w => w.DoctorId == doctorId);
        _db.DoctorWorkingHours.RemoveRange(existing);

        _db.DoctorWorkingHours.AddRange(requests.Select(r => new DoctorWorkingHour
        {
            DoctorId = doctorId,
            DayOfWeek = r.DayOfWeek,
            StartTime = r.StartTime,
            EndTime = r.EndTime,
            IsActive = r.IsActive
        }));

        await _db.SaveChangesAsync(ct);
        return await GetForDoctorAsync(doctorId, ct);
    }
}
