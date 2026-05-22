using VetVik.Modules.MedicalRecords.Application.DTOs;

namespace VetVik.Modules.MedicalRecords.Application.Services;

public interface IMedicalRecordService
{
    Task<MedicalRecordResponse> GetAsync(Guid id, CancellationToken ct);
    Task<MedicalRecordResponse?> GetByAppointmentAsync(Guid appointmentId, CancellationToken ct);
    Task<IReadOnlyList<MedicalRecordResponse>> GetByPetAsync(Guid petId, CancellationToken ct);
    Task<MedicalRecordResponse> CreateAsync(CreateMedicalRecordRequest req, CancellationToken ct);
    Task<MedicalRecordResponse> UpdateAsync(Guid id, UpdateMedicalRecordRequest req, CancellationToken ct);
}
