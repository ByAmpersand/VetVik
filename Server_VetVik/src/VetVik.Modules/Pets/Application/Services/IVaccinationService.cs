using VetVik.Modules.Pets.Application.DTOs;

namespace VetVik.Modules.Pets.Application.Services;

public interface IVaccinationService
{
    Task<IReadOnlyList<VaccinationResponse>> GetByPetAsync(Guid petId, CancellationToken ct);
    Task<IReadOnlyList<VaccinationResponse>> GetForCurrentOwnerAsync(string userId, CancellationToken ct);
    Task<VaccinationResponse> CreateAsync(UpsertVaccinationRequest request, CancellationToken ct);
    Task<VaccinationResponse> UpdateAsync(Guid id, UpsertVaccinationRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
