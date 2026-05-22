using VetVik.Modules.Doctors.Application.DTOs;

namespace VetVik.Modules.Doctors.Application.Services;

public interface IDoctorService
{
    Task<IReadOnlyList<DoctorResponse>> GetAllAsync(bool includeInactive, Guid? specializationId, CancellationToken ct);
    Task<DoctorResponse> GetAsync(Guid id, CancellationToken ct);
    Task<DoctorResponse> CreateAsync(CreateDoctorRequest req, CancellationToken ct);
    Task<DoctorResponse> UpdateAsync(Guid id, UpdateDoctorRequest req, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);

    Task<DoctorResponse> AssignSpecializationAsync(Guid doctorId, Guid specializationId, CancellationToken ct);
    Task<DoctorResponse> RemoveSpecializationAsync(Guid doctorId, Guid specializationId, CancellationToken ct);
}

public interface ISpecializationService
{
    Task<IReadOnlyList<SpecializationResponse>> GetAllAsync(bool includeInactive, CancellationToken ct);
    Task<SpecializationResponse> GetAsync(Guid id, CancellationToken ct);
    Task<SpecializationResponse> CreateAsync(UpsertSpecializationRequest req, CancellationToken ct);
    Task<SpecializationResponse> UpdateAsync(Guid id, UpsertSpecializationRequest req, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public interface IDoctorWorkingHoursService
{
    Task<IReadOnlyList<DoctorWorkingHourResponse>> GetForDoctorAsync(Guid doctorId, CancellationToken ct);
    Task<IReadOnlyList<DoctorWorkingHourResponse>> ReplaceForDoctorAsync(
        Guid doctorId, IReadOnlyList<UpsertDoctorWorkingHourRequest> requests, CancellationToken ct);
}
