using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Time;
using VetVik.Modules.Appointments.Application.DTOs;
using VetVik.Modules.Appointments.Application.Rules;
using VetVik.Modules.Appointments.Domain.Entities;
using VetVik.Modules.Appointments.Domain.Enums;
using VetVik.Modules.Identity.Application.Services;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Appointments.Application.Services;

internal sealed class AppointmentService : IAppointmentService
{
    private readonly VetVikDbContext _db;
    private readonly IClock _clock;
    private readonly INotificationService _notifications;
    private static readonly AppointmentStatus[] BlockingStatuses =
    {
        AppointmentStatus.Scheduled,
        AppointmentStatus.Confirmed,
        AppointmentStatus.Completed
    };

    public AppointmentService(VetVikDbContext db, IClock clock, INotificationService notifications)
    {
        _db = db;
        _clock = clock;
        _notifications = notifications;
    }

    public async Task<AppointmentResponse> GetAsync(Guid id, CancellationToken ct)
    {
        var a = await BaseQuery(_db.Appointments.AsNoTracking().Where(a => a.Id == id)).FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException("Appointment", id);
        return a;
    }

    public async Task<IReadOnlyList<AppointmentResponse>> GetByOwnerAsync(Guid ownerId, CancellationToken ct) =>
        await BaseQuery(
            _db.Appointments.AsNoTracking()
                .Where(a => a.OwnerId == ownerId)
                .OrderByDescending(a => a.StartAt))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<AppointmentResponse>> GetForCurrentOwnerAsync(string userId, CancellationToken ct)
    {
        var owner = await _db.OwnerProfiles.AsNoTracking().FirstOrDefaultAsync(o => o.UserId == userId, ct)
            ?? throw new NotFoundException("OwnerProfile", userId);
        return await GetByOwnerAsync(owner.Id, ct);
    }

    public async Task<IReadOnlyList<AppointmentResponse>> GetByDoctorAsync(Guid doctorId, CancellationToken ct) =>
        await BaseQuery(
            _db.Appointments.AsNoTracking()
                .Where(a => a.DoctorId == doctorId)
                .OrderByDescending(a => a.StartAt))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<AppointmentResponse>> GetForCurrentDoctorAsync(string userId, CancellationToken ct)
    {
        var doctor = await _db.DoctorProfiles.AsNoTracking().FirstOrDefaultAsync(d => d.UserId == userId, ct)
            ?? throw new NotFoundException("DoctorProfile", userId);
        return await GetByDoctorAsync(doctor.Id, ct);
    }

    public async Task<IReadOnlyList<AppointmentResponse>> GetByDateRangeAsync(
        DateTime from, DateTime to, Guid? doctorId, Guid? roomId, CancellationToken ct)
    {
        if (to <= from) throw new BusinessRuleException("Range 'to' must be greater than 'from'.");

        var q = _db.Appointments.AsNoTracking().Where(a => a.StartAt < to && a.EndAt > from);
        if (doctorId.HasValue) q = q.Where(a => a.DoctorId == doctorId.Value);
        if (roomId.HasValue) q = q.Where(a => a.RoomId == roomId.Value);
        return await BaseQuery(q.OrderBy(a => a.StartAt)).ToListAsync(ct);
    }

    public Task<IReadOnlyList<AppointmentResponse>> GetCalendarAsync(DateTime from, DateTime to, CancellationToken ct)
        => GetByDateRangeAsync(from, to, null, null, ct);

    public async Task<IReadOnlyList<AvailableAppointmentSlotResponse>> FindAvailableSlotsAsync(
        FindAvailableAppointmentSlotsRequest r,
        CancellationToken ct)
    {
        if (r.To <= r.From)
            throw new BusinessRuleException("Range 'to' must be greater than 'from'.");

        if (r.MaxSlots <= 0)
            return Array.Empty<AvailableAppointmentSlotResponse>();

        var service = await _db.Services.AsNoTracking().FirstOrDefaultAsync(s => s.Id == r.ServiceId, ct)
            ?? throw new NotFoundException("Service", r.ServiceId);

        var clinicHours = await _db.ClinicWorkingHours.AsNoTracking().ToListAsync(ct);
        var roomQuery = _db.Rooms.AsNoTracking().Where(room => room.IsActive);
        if (r.RoomId.HasValue)
            roomQuery = roomQuery.Where(room => room.Id == r.RoomId.Value);

        var rooms = await roomQuery
            .OrderBy(room => room.Name)
            .Select(room => new RoomOption(room.Id, room.Name))
            .ToListAsync(ct);
        if (r.RoomId.HasValue && rooms.Count == 0)
            throw new NotFoundException("Room", r.RoomId.Value);
        if (rooms.Count == 0)
            return Array.Empty<AvailableAppointmentSlotResponse>();

        var doctorQuery = _db.DoctorProfiles.AsNoTracking().Where(d => d.IsActive);
        if (r.DoctorId.HasValue)
            doctorQuery = doctorQuery.Where(d => d.Id == r.DoctorId.Value);

        var doctors = await doctorQuery
            .OrderBy(d => d.LastName).ThenBy(d => d.FirstName)
            .Select(d => new DoctorOption(
                d.Id,
                (d.FirstName + " " + d.LastName).Trim()))
            .ToListAsync(ct);

        if (r.DoctorId.HasValue && doctors.Count == 0)
            throw new NotFoundException("DoctorProfile", r.DoctorId.Value);
        if (doctors.Count == 0)
            return Array.Empty<AvailableAppointmentSlotResponse>();

        var doctorIds = doctors.Select(d => d.Id).ToList();
        var doctorHours = await _db.DoctorWorkingHours.AsNoTracking()
            .Where(h => doctorIds.Contains(h.DoctorId))
            .ToListAsync(ct);

        var fromDay = r.From.Date;
        var toDayExclusive = r.To.Date.AddDays(1);

        var appointments = await _db.Appointments.AsNoTracking()
            .Where(a =>
                BlockingStatuses.Contains(a.Status) &&
                a.StartAt < r.To &&
                a.EndAt > r.From &&
                a.StartAt >= fromDay &&
                a.StartAt < toDayExclusive)
            .Select(a => new BlockingAppointment(a.DoctorId, a.RoomId, a.StartAt, a.EndAt))
            .ToListAsync(ct);

        var duration = TimeSpan.FromMinutes(service.DurationMinutes);
        var step = TimeSpan.FromMinutes(r.StepMinutes);
        var slots = new List<AvailableAppointmentSlotResponse>(Math.Min(r.MaxSlots, 128));
        var autoAssignedDoctor = !r.DoctorId.HasValue;

        for (var startAt = r.From; startAt + duration <= r.To; startAt = startAt.Add(step))
        {
            var endAt = startAt.Add(duration);

            if (!AppointmentRules.WithinSameLocalDay(startAt, endAt))
                continue;

            if (!AppointmentRules.WithinClinicHours(startAt, endAt, clinicHours))
                continue;

            foreach (var doctor in doctors)
            {
                var doctorDayHours = doctorHours.Where(h => h.DoctorId == doctor.Id);
                if (!AppointmentRules.WithinDoctorHours(startAt, endAt, doctorDayHours))
                    continue;

                var hasDoctorConflict = appointments.Any(a =>
                    a.DoctorId == doctor.Id
                    && AppointmentRules.Overlaps(startAt, endAt, a.StartAt, a.EndAt));
                if (hasDoctorConflict)
                    continue;

                foreach (var room in rooms)
                {
                    var hasRoomConflict = appointments.Any(a =>
                        a.RoomId == room.Id
                        && AppointmentRules.Overlaps(startAt, endAt, a.StartAt, a.EndAt));
                    if (hasRoomConflict)
                        continue;

                    slots.Add(new AvailableAppointmentSlotResponse(
                        startAt,
                        endAt,
                        doctor.Id,
                        doctor.FullName,
                        room.Id,
                        room.Name,
                        autoAssignedDoctor));

                    if (slots.Count >= r.MaxSlots)
                        break;
                }

                if (slots.Count >= r.MaxSlots)
                    break;
            }

            if (slots.Count >= r.MaxSlots)
                break;
        }

        return slots;
    }

    public async Task<AppointmentResponse> CreateAsync(
        CreateAppointmentRequest r, string? actingUserId, bool actingIsOwner, CancellationToken ct)
    {
        var pet = await _db.Pets.AsNoTracking().FirstOrDefaultAsync(p => p.Id == r.PetId, ct)
            ?? throw new NotFoundException("Pet", r.PetId);

        var ownerId = await ResolveOwnerIdAsync(r, pet, actingUserId, actingIsOwner, ct);

        var service = await _db.Services.AsNoTracking().FirstOrDefaultAsync(s => s.Id == r.ServiceId, ct)
            ?? throw new NotFoundException("Service", r.ServiceId);

        var startAt = r.StartAt;
        var endAt = r.EndAt ?? startAt.AddMinutes(service.DurationMinutes);
        var (doctorId, roomId) = await ResolveDoctorAndRoomAsync(r.DoctorId, r.RoomId, startAt, endAt, ct);

        await EnsureBookingIsLegalAsync(doctorId, roomId, startAt, endAt, excludeAppointmentId: null, ct);

        var entity = new Appointment
        {
            OwnerId = ownerId,
            PetId = r.PetId,
            DoctorId = doctorId,
            RoomId = roomId,
            ServiceId = r.ServiceId,
            StartAt = startAt,
            EndAt = endAt,
            Status = AppointmentStatus.Scheduled,
            Reason = r.Reason,
            Notes = r.Notes
        };
        _db.Appointments.Add(entity);
        await _db.SaveChangesAsync(ct);
        await _notifications.NotifyAppointmentEventAsync(
            entity.Id, AppointmentNotificationKind.Created, actingUserId, ct);
        return await GetAsync(entity.Id, ct);
    }

    public async Task<AppointmentResponse> UpdateAsync(Guid id, UpdateAppointmentRequest r, CancellationToken ct)
    {
        var entity = await _db.Appointments.FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException("Appointment", id);

        if (entity.Status is AppointmentStatus.Completed or AppointmentStatus.Cancelled or AppointmentStatus.NoShow)
            throw new BusinessRuleException(
                $"Cannot modify an appointment in status {entity.Status}.");

        var pet = await _db.Pets.AsNoTracking().FirstOrDefaultAsync(p => p.Id == r.PetId, ct)
            ?? throw new NotFoundException("Pet", r.PetId);

        var service = await _db.Services.AsNoTracking().FirstOrDefaultAsync(s => s.Id == r.ServiceId, ct)
            ?? throw new NotFoundException("Service", r.ServiceId);

        if (!await _db.DoctorProfiles.AnyAsync(d => d.Id == r.DoctorId && d.IsActive, ct))
            throw new NotFoundException("DoctorProfile", r.DoctorId);

        if (!await _db.Rooms.AnyAsync(rm => rm.Id == r.RoomId && rm.IsActive, ct))
            throw new NotFoundException("Room", r.RoomId);

        var startAt = r.StartAt;
        var endAt = r.EndAt ?? startAt.AddMinutes(service.DurationMinutes);

        await EnsureBookingIsLegalAsync(r.DoctorId, r.RoomId, startAt, endAt, excludeAppointmentId: entity.Id, ct);

        entity.OwnerId = pet.OwnerId;
        entity.PetId = r.PetId;
        entity.DoctorId = r.DoctorId;
        entity.RoomId = r.RoomId;
        entity.ServiceId = r.ServiceId;
        entity.StartAt = startAt;
        entity.EndAt = endAt;
        entity.Reason = r.Reason;
        entity.Notes = r.Notes;
        entity.UpdatedAt = _clock.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetAsync(entity.Id, ct);
    }

    public async Task<AppointmentResponse> CancelAsync(Guid id, CancelAppointmentRequest r, string? actingUserId, CancellationToken ct)
    {
        var entity = await _db.Appointments.FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException("Appointment", id);

        if (entity.Status is AppointmentStatus.Completed)
            throw new BusinessRuleException("Completed appointments cannot be cancelled.");

        if (entity.Status is AppointmentStatus.Cancelled)
            return await GetAsync(entity.Id, ct);

        entity.Status = AppointmentStatus.Cancelled;
        entity.CancelledAt = _clock.UtcNow;
        entity.CancellationReason = r.Reason;
        entity.UpdatedAt = _clock.UtcNow;
        await _db.SaveChangesAsync(ct);
        await _notifications.NotifyAppointmentEventAsync(
            entity.Id, AppointmentNotificationKind.Cancelled, actingUserId, ct);
        return await GetAsync(entity.Id, ct);
    }

    public async Task<AppointmentResponse> ConfirmAsync(Guid id, CancellationToken ct)
    {
        var entity = await _db.Appointments.FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException("Appointment", id);

        if (entity.Status is AppointmentStatus.Cancelled or AppointmentStatus.NoShow or AppointmentStatus.Completed)
            throw new BusinessRuleException($"Cannot confirm an appointment in status {entity.Status}.");

        if (entity.Status is AppointmentStatus.Confirmed)
            return await GetAsync(entity.Id, ct);

        entity.Status = AppointmentStatus.Confirmed;
        entity.UpdatedAt = _clock.UtcNow;
        await _db.SaveChangesAsync(ct);
        await _notifications.NotifyAppointmentEventAsync(
            entity.Id, AppointmentNotificationKind.Confirmed, actorUserId: null, ct);
        return await GetAsync(entity.Id, ct);
    }

    public async Task<AppointmentResponse> RejectAsync(Guid id, string? reason, CancellationToken ct)
    {
        var entity = await _db.Appointments.FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException("Appointment", id);

        if (entity.Status is AppointmentStatus.Completed)
            throw new BusinessRuleException("Completed appointments cannot be rejected.");

        if (entity.Status is not AppointmentStatus.Scheduled)
            throw new BusinessRuleException($"Only pending (Scheduled) appointments can be rejected, current status is {entity.Status}.");

        entity.Status = AppointmentStatus.Cancelled;
        entity.CancelledAt = _clock.UtcNow;
        entity.CancellationReason = string.IsNullOrWhiteSpace(reason) ? "Rejected by doctor" : reason;
        entity.UpdatedAt = _clock.UtcNow;
        await _db.SaveChangesAsync(ct);
        await _notifications.NotifyAppointmentEventAsync(
            entity.Id, AppointmentNotificationKind.Rejected, actorUserId: null, ct);
        return await GetAsync(entity.Id, ct);
    }

    public async Task<AppointmentResponse> CompleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await _db.Appointments.FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException("Appointment", id);

        if (entity.Status is AppointmentStatus.Cancelled or AppointmentStatus.NoShow)
            throw new BusinessRuleException($"Cannot complete an appointment in status {entity.Status}.");

        entity.Status = AppointmentStatus.Completed;
        entity.UpdatedAt = _clock.UtcNow;
        await _db.SaveChangesAsync(ct);
        await _notifications.NotifyAppointmentEventAsync(
            entity.Id, AppointmentNotificationKind.Completed, actorUserId: null, ct);
        return await GetAsync(entity.Id, ct);
    }

    private async Task<Guid> ResolveOwnerIdAsync(
        CreateAppointmentRequest r,
        Pets.Domain.Entities.Pet pet,
        string? actingUserId,
        bool actingIsOwner,
        CancellationToken ct)
    {
        if (actingIsOwner)
        {
            if (string.IsNullOrEmpty(actingUserId))
                throw new ForbiddenException("Authentication required.");

            var owner = await _db.OwnerProfiles.AsNoTracking()
                .FirstOrDefaultAsync(o => o.UserId == actingUserId, ct)
                ?? throw new NotFoundException("OwnerProfile", actingUserId);

            if (pet.OwnerId != owner.Id)
                throw new ForbiddenException("You can create appointments only for your own pets.");
            return owner.Id;
        }

        // Admin/Doctor flow: owner is taken from the pet to keep invariants consistent
        // (one pet always belongs to exactly one owner). The explicit OwnerId in the request
        // must match if supplied.
        if (r.OwnerId.HasValue && r.OwnerId.Value != pet.OwnerId)
            throw new BusinessRuleException("Provided OwnerId does not match the pet's owner.");

        return pet.OwnerId;
    }

    private async Task EnsureBookingIsLegalAsync(
        Guid doctorId, Guid roomId, DateTime startAt, DateTime endAt, Guid? excludeAppointmentId, CancellationToken ct)
    {
        if (!AppointmentRules.TimeRangeIsValid(startAt, endAt))
            throw new BusinessRuleException("Appointment end time must be after start time.");

        if (!AppointmentRules.WithinSameLocalDay(startAt, endAt))
            throw new BusinessRuleException("Appointment must start and end on the same day.");

        if (startAt < _clock.UtcNow)
            throw new BusinessRuleException("Appointment cannot start in the past.");

        var clinicHours = await _db.ClinicWorkingHours.AsNoTracking().ToListAsync(ct);
        if (!AppointmentRules.WithinClinicHours(startAt, endAt, clinicHours))
            throw new BusinessRuleException("Appointment is outside clinic working hours.");

        var doctorHours = await _db.DoctorWorkingHours.AsNoTracking()
            .Where(h => h.DoctorId == doctorId).ToListAsync(ct);
        if (!AppointmentRules.WithinDoctorHours(startAt, endAt, doctorHours))
            throw new BusinessRuleException("Appointment is outside doctor working hours.");

        var doctorConflict = await _db.Appointments.AsNoTracking().AnyAsync(a =>
            a.DoctorId == doctorId
            && a.Id != (excludeAppointmentId ?? Guid.Empty)
            && BlockingStatuses.Contains(a.Status)
            && a.StartAt < endAt
            && a.EndAt > startAt, ct);
        if (doctorConflict)
            throw new ConflictException("Doctor already has an appointment in this time slot.");

        var roomConflict = await _db.Appointments.AsNoTracking().AnyAsync(a =>
            a.RoomId == roomId
            && a.Id != (excludeAppointmentId ?? Guid.Empty)
            && BlockingStatuses.Contains(a.Status)
            && a.StartAt < endAt
            && a.EndAt > startAt, ct);
        if (roomConflict)
            throw new ConflictException("Room is already booked in this time slot.");
    }

    private async Task<Guid> ResolveRoomIdAsync(
        Guid? requestedRoomId, DateTime startAt, DateTime endAt, CancellationToken ct)
    {
        if (requestedRoomId.HasValue && requestedRoomId.Value != Guid.Empty)
        {
            if (!await _db.Rooms.AnyAsync(rm => rm.Id == requestedRoomId.Value && rm.IsActive, ct))
                throw new NotFoundException("Room", requestedRoomId.Value);
            return requestedRoomId.Value;
        }

        return await FindAvailableRoomAsync(startAt, endAt, ct);
    }

    private async Task<Guid> FindAvailableRoomAsync(DateTime startAt, DateTime endAt, CancellationToken ct)
    {
        var activeRooms = await _db.Rooms.AsNoTracking()
            .Where(r => r.IsActive)
            .OrderBy(r => r.Name)
            .ToListAsync(ct);

        if (activeRooms.Count == 0)
            throw new BusinessRuleException("No exam rooms are available for booking.");

        foreach (var room in activeRooms)
        {
            var roomConflict = await _db.Appointments.AsNoTracking().AnyAsync(a =>
                a.RoomId == room.Id
                && BlockingStatuses.Contains(a.Status)
                && a.StartAt < endAt
                && a.EndAt > startAt, ct);
            if (!roomConflict)
                return room.Id;
        }

        throw new ConflictException("No exam room is free for the selected time slot.");
    }

    private async Task<(Guid DoctorId, Guid RoomId)> ResolveDoctorAndRoomAsync(
        Guid? requestedDoctorId,
        Guid? requestedRoomId,
        DateTime startAt,
        DateTime endAt,
        CancellationToken ct)
    {
        if (requestedDoctorId.HasValue && requestedDoctorId.Value != Guid.Empty)
        {
            if (!await _db.DoctorProfiles.AnyAsync(d => d.Id == requestedDoctorId.Value && d.IsActive, ct))
                throw new NotFoundException("DoctorProfile", requestedDoctorId.Value);

            var roomId = await ResolveRoomIdAsync(requestedRoomId, startAt, endAt, ct);
            return (requestedDoctorId.Value, roomId);
        }

        return await FindAvailableDoctorAndRoomAsync(startAt, endAt, requestedRoomId, ct);
    }

    private async Task<(Guid DoctorId, Guid RoomId)> FindAvailableDoctorAndRoomAsync(
        DateTime startAt,
        DateTime endAt,
        Guid? requestedRoomId,
        CancellationToken ct)
    {
        if (!AppointmentRules.TimeRangeIsValid(startAt, endAt))
            throw new BusinessRuleException("Appointment end time must be after start time.");

        if (startAt < _clock.UtcNow)
            throw new BusinessRuleException("Appointment cannot start in the past.");

        var clinicHours = await _db.ClinicWorkingHours.AsNoTracking().ToListAsync(ct);
        if (!AppointmentRules.WithinClinicHours(startAt, endAt, clinicHours))
            throw new BusinessRuleException("Appointment is outside clinic working hours.");

        var doctors = await _db.DoctorProfiles.AsNoTracking()
            .Where(d => d.IsActive)
            .OrderBy(d => d.LastName).ThenBy(d => d.FirstName)
            .Select(d => d.Id)
            .ToListAsync(ct);
        if (doctors.Count == 0)
            throw new BusinessRuleException("No active doctors are available for booking.");

        List<Guid> rooms;
        if (requestedRoomId.HasValue && requestedRoomId.Value != Guid.Empty)
        {
            if (!await _db.Rooms.AsNoTracking().AnyAsync(rm => rm.Id == requestedRoomId.Value && rm.IsActive, ct))
                throw new NotFoundException("Room", requestedRoomId.Value);
            rooms = new List<Guid> { requestedRoomId.Value };
        }
        else
        {
            rooms = await _db.Rooms.AsNoTracking()
                .Where(r => r.IsActive)
                .OrderBy(r => r.Name)
                .Select(r => r.Id)
                .ToListAsync(ct);
        }

        if (rooms.Count == 0)
            throw new BusinessRuleException("No exam rooms are available for booking.");

        var doctorHours = await _db.DoctorWorkingHours.AsNoTracking()
            .Where(h => doctors.Contains(h.DoctorId))
            .ToListAsync(ct);

        var blockingAppointments = await _db.Appointments.AsNoTracking()
            .Where(a =>
                BlockingStatuses.Contains(a.Status) &&
                a.StartAt < endAt &&
                a.EndAt > startAt &&
                (doctors.Contains(a.DoctorId) || rooms.Contains(a.RoomId)))
            .Select(a => new BlockingAppointment(a.DoctorId, a.RoomId, a.StartAt, a.EndAt))
            .ToListAsync(ct);

        foreach (var doctorId in doctors)
        {
            var doctorDayHours = doctorHours.Where(h => h.DoctorId == doctorId);
            if (!AppointmentRules.WithinDoctorHours(startAt, endAt, doctorDayHours))
                continue;

            var doctorConflict = blockingAppointments.Any(a =>
                a.DoctorId == doctorId
                && AppointmentRules.Overlaps(startAt, endAt, a.StartAt, a.EndAt));
            if (doctorConflict)
                continue;

            foreach (var roomId in rooms)
            {
                var roomConflict = blockingAppointments.Any(a =>
                    a.RoomId == roomId
                    && AppointmentRules.Overlaps(startAt, endAt, a.StartAt, a.EndAt));
                if (!roomConflict)
                    return (doctorId, roomId);
            }
        }

        throw new ConflictException("No available doctor and room for the selected time slot.");
    }

    private IQueryable<AppointmentResponse> BaseQuery(IQueryable<Appointment> appointments) =>
        appointments.Select(a => new AppointmentResponse(
                a.Id,
                a.OwnerId,
                (a.Owner!.FirstName + " " + a.Owner.LastName).Trim(),
                a.PetId,
                a.Pet!.Name,
                a.Pet.Species!.Name,
                a.DoctorId,
                (a.Doctor!.FirstName + " " + a.Doctor.LastName).Trim(),
                a.RoomId,
                a.Room!.Name,
                a.ServiceId,
                a.Service!.Name,
                a.Service.DurationMinutes,
                a.StartAt,
                a.EndAt,
                a.Status,
                a.Reason,
                a.Notes,
                a.CreatedAt,
                a.UpdatedAt,
                a.CancelledAt,
                a.CancellationReason));

    private sealed record DoctorOption(Guid Id, string FullName);
    private sealed record RoomOption(Guid Id, string Name);
    private sealed record BlockingAppointment(Guid DoctorId, Guid RoomId, DateTime StartAt, DateTime EndAt);
}
