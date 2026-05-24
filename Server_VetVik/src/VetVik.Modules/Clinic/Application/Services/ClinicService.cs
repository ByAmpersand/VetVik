using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Time;
using VetVik.Modules.Clinic.Application.DTOs;
using VetVik.Modules.Clinic.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Clinic.Application.Services;

internal sealed class ClinicService : IClinicService
{
    private readonly VetVikDbContext _db;
    private readonly IClock _clock;

    public ClinicService(VetVikDbContext db, IClock clock) { _db = db; _clock = clock; }

    public async Task<ClinicSettingsResponse> GetSettingsAsync(CancellationToken ct)
    {
        var s = await _db.ClinicSettings.AsNoTracking()
            .Include(x => x.WorkingHours)
            .FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException("ClinicSettings is not configured.");

        return ToResponse(s);
    }

    public async Task<ClinicSettingsResponse> UpdateSettingsAsync(UpdateClinicSettingsRequest r, CancellationToken ct)
    {
        var s = await _db.ClinicSettings.Include(x => x.WorkingHours).FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException("ClinicSettings is not configured.");

        s.Name = r.Name;
        s.Address = r.Address;
        s.PhoneNumber = r.PhoneNumber;
        s.Email = r.Email;
        s.Description = r.Description;
        s.UpdatedAt = _clock.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToResponse(s);
    }

    public async Task<IReadOnlyList<ClinicWorkingHourResponse>> GetWorkingHoursAsync(CancellationToken ct)
    {
        return await _db.ClinicWorkingHours.AsNoTracking()
            .OrderBy(x => x.DayOfWeek)
            .Select(x => new ClinicWorkingHourResponse(x.Id, x.DayOfWeek, x.OpenTime, x.CloseTime, x.IsWorkingDay))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ClinicWorkingHourResponse>> ReplaceWorkingHoursAsync(
        IReadOnlyList<UpsertClinicWorkingHourRequest> requests, CancellationToken ct)
    {
        var settings = await _db.ClinicSettings.Include(x => x.WorkingHours).FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException("ClinicSettings is not configured.");

        var requestsByDay = new Dictionary<DayOfWeek, UpsertClinicWorkingHourRequest>();
        foreach (var r in requests)
        {
            if (r.CloseTime <= r.OpenTime && r.IsWorkingDay)
                throw new BusinessRuleException(
                    $"Close time must be after open time for {r.DayOfWeek}.");

            if (!requestsByDay.TryAdd(r.DayOfWeek, r))
                throw new BusinessRuleException($"Duplicate working hours for {r.DayOfWeek}.");
        }

        foreach (var hour in settings.WorkingHours.ToList())
        {
            if (!requestsByDay.TryGetValue(hour.DayOfWeek, out var request))
            {
                _db.ClinicWorkingHours.Remove(hour);
                continue;
            }

            hour.OpenTime = request.OpenTime;
            hour.CloseTime = request.CloseTime;
            hour.IsWorkingDay = request.IsWorkingDay;
        }

        var existingDays = settings.WorkingHours.Select(h => h.DayOfWeek).ToHashSet();
        foreach (var request in requestsByDay.Values.Where(r => !existingDays.Contains(r.DayOfWeek)))
        {
            settings.WorkingHours.Add(new ClinicWorkingHour
            {
                ClinicSettingsId = settings.Id,
                DayOfWeek = request.DayOfWeek,
                OpenTime = request.OpenTime,
                CloseTime = request.CloseTime,
                IsWorkingDay = request.IsWorkingDay
            });
        }

        settings.UpdatedAt = _clock.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetWorkingHoursAsync(ct);
    }

    public async Task<IReadOnlyList<RoomResponse>> GetRoomsAsync(bool includeInactive, CancellationToken ct)
    {
        var q = _db.Rooms.AsNoTracking();
        if (!includeInactive) q = q.Where(r => r.IsActive);
        return await q.OrderBy(r => r.Name)
            .Select(r => new RoomResponse(r.Id, r.Name, r.Description, r.IsActive))
            .ToListAsync(ct);
    }

    public async Task<RoomResponse> GetRoomAsync(Guid id, CancellationToken ct)
    {
        var r = await _db.Rooms.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Room", id);
        return new RoomResponse(r.Id, r.Name, r.Description, r.IsActive);
    }

    public async Task<RoomResponse> CreateRoomAsync(UpsertRoomRequest r, CancellationToken ct)
    {
        if (await _db.Rooms.AnyAsync(x => x.Name == r.Name, ct))
            throw new ConflictException($"Room with name '{r.Name}' already exists.");

        var room = new Room { Name = r.Name, Description = r.Description, IsActive = r.IsActive };
        _db.Rooms.Add(room);
        await _db.SaveChangesAsync(ct);
        return new RoomResponse(room.Id, room.Name, room.Description, room.IsActive);
    }

    public async Task<RoomResponse> UpdateRoomAsync(Guid id, UpsertRoomRequest r, CancellationToken ct)
    {
        var room = await _db.Rooms.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Room", id);

        if (await _db.Rooms.AnyAsync(x => x.Id != id && x.Name == r.Name, ct))
            throw new ConflictException($"Room with name '{r.Name}' already exists.");

        room.Name = r.Name;
        room.Description = r.Description;
        room.IsActive = r.IsActive;
        await _db.SaveChangesAsync(ct);
        return new RoomResponse(room.Id, room.Name, room.Description, room.IsActive);
    }

    public async Task DeleteRoomAsync(Guid id, CancellationToken ct)
    {
        var room = await _db.Rooms.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Room", id);

        var inUse = await _db.Appointments.AnyAsync(a => a.RoomId == id, ct);
        if (inUse)
        {
            // Soft-deactivate when the room has historical appointments.
            room.IsActive = false;
            await _db.SaveChangesAsync(ct);
            return;
        }

        _db.Rooms.Remove(room);
        await _db.SaveChangesAsync(ct);
    }

    private static ClinicSettingsResponse ToResponse(ClinicSettings s) => new(
        s.Id, s.Name, s.Address, s.PhoneNumber, s.Email, s.Description, s.UpdatedAt,
        s.WorkingHours
            .OrderBy(w => w.DayOfWeek)
            .Select(w => new ClinicWorkingHourResponse(w.Id, w.DayOfWeek, w.OpenTime, w.CloseTime, w.IsWorkingDay))
            .ToList());
}
