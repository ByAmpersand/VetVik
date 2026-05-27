using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Time;
using VetVik.Modules.Appointments.Domain.Enums;
using VetVik.Modules.Identity.Application.Services;
using VetVik.Modules.MedicalRecords.Application.DTOs;
using VetVik.Modules.MedicalRecords.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.MedicalRecords.Application.Services;

internal sealed class MedicalRecordService : IMedicalRecordService
{
    private readonly VetVikDbContext _db;
    private readonly IClock _clock;
    private readonly INotificationService _notifications;

    public MedicalRecordService(VetVikDbContext db, IClock clock, INotificationService notifications)
    {
        _db = db;
        _clock = clock;
        _notifications = notifications;
    }

    public async Task<MedicalRecordResponse> GetAsync(Guid id, CancellationToken ct)
    {
        var r = await BaseQuery(_db.MedicalRecords.AsNoTracking().Where(m => m.Id == id)).FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException("MedicalRecord", id);
        return r;
    }

    public async Task<MedicalRecordResponse?> GetByAppointmentAsync(Guid appointmentId, CancellationToken ct) =>
        await BaseQuery(_db.MedicalRecords.AsNoTracking().Where(m => m.AppointmentId == appointmentId))
            .FirstOrDefaultAsync(ct);

    public async Task<IReadOnlyList<MedicalRecordResponse>> GetByPetAsync(Guid petId, CancellationToken ct) =>
        await BaseQuery(
            _db.MedicalRecords.AsNoTracking()
                .Where(r => r.PetId == petId)
                .OrderByDescending(r => r.Appointment!.StartAt))
            .ToListAsync(ct);

    public async Task<MedicalRecordResponse> CreateAsync(CreateMedicalRecordRequest r, CancellationToken ct)
    {
        var appt = await _db.Appointments.AsNoTracking().FirstOrDefaultAsync(a => a.Id == r.AppointmentId, ct)
            ?? throw new NotFoundException("Appointment", r.AppointmentId);

        if (appt.Status != AppointmentStatus.Completed)
            throw new BusinessRuleException(
                "A medical record can only be created for a Completed appointment.");

        if (await _db.MedicalRecords.AnyAsync(m => m.AppointmentId == r.AppointmentId, ct))
            throw new ConflictException("This appointment already has a medical record.");

        var record = new MedicalRecord
        {
            AppointmentId = appt.Id,
            PetId = appt.PetId,
            DoctorId = appt.DoctorId,
            Symptoms = r.Symptoms,
            Diagnosis = r.Diagnosis,
            Treatment = r.Treatment,
            Recommendations = r.Recommendations
        };
        _db.MedicalRecords.Add(record);
        await _db.SaveChangesAsync(ct);
        await _notifications.NotifyMedicalRecordCreatedAsync(appt.Id, ct);
        return await GetAsync(record.Id, ct);
    }

    public async Task<MedicalRecordResponse> UpdateAsync(Guid id, UpdateMedicalRecordRequest r, CancellationToken ct)
    {
        var record = await _db.MedicalRecords.FirstOrDefaultAsync(m => m.Id == id, ct)
            ?? throw new NotFoundException("MedicalRecord", id);

        record.Symptoms = r.Symptoms;
        record.Diagnosis = r.Diagnosis;
        record.Treatment = r.Treatment;
        record.Recommendations = r.Recommendations;
        record.UpdatedAt = _clock.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await GetAsync(record.Id, ct);
    }

    private IQueryable<MedicalRecordResponse> BaseQuery(IQueryable<MedicalRecord> records) =>
        records.Select(m => new MedicalRecordResponse(
                m.Id,
                m.AppointmentId,
                m.Appointment!.StartAt,
                m.PetId,
                m.Pet!.Name,
                m.DoctorId,
                (m.Doctor!.FirstName + " " + m.Doctor.LastName).Trim(),
                m.Symptoms,
                m.Diagnosis,
                m.Treatment,
                m.Recommendations,
                m.CreatedAt,
                m.UpdatedAt));
}
