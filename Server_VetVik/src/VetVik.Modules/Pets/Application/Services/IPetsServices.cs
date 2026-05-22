using VetVik.Modules.Pets.Application.DTOs;

namespace VetVik.Modules.Pets.Application.Services;

public interface IAnimalSpeciesService
{
    Task<IReadOnlyList<AnimalSpeciesResponse>> GetAllAsync(bool includeInactive, CancellationToken ct);
    Task<AnimalSpeciesResponse> GetAsync(Guid id, CancellationToken ct);
    Task<AnimalSpeciesResponse> CreateAsync(UpsertAnimalSpeciesRequest req, CancellationToken ct);
    Task<AnimalSpeciesResponse> UpdateAsync(Guid id, UpsertAnimalSpeciesRequest req, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public interface IBreedService
{
    Task<IReadOnlyList<BreedResponse>> GetAllAsync(Guid? speciesId, bool includeInactive, CancellationToken ct);
    Task<BreedResponse> GetAsync(Guid id, CancellationToken ct);
    Task<BreedResponse> CreateAsync(UpsertBreedRequest req, CancellationToken ct);
    Task<BreedResponse> UpdateAsync(Guid id, UpsertBreedRequest req, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public interface IPetService
{
    Task<IReadOnlyList<PetResponse>> GetAllAsync(CancellationToken ct);
    Task<IReadOnlyList<PetResponse>> GetByOwnerAsync(Guid ownerId, CancellationToken ct);
    Task<IReadOnlyList<PetResponse>> GetForCurrentOwnerAsync(string userId, CancellationToken ct);
    Task<PetResponse> GetAsync(Guid id, CancellationToken ct);
    Task<PetResponse> CreateAsync(UpsertPetRequest req, CancellationToken ct);
    Task<PetResponse> CreateForCurrentOwnerAsync(string userId, CreatePetMineRequest req, CancellationToken ct);
    Task<PetResponse> UpdateAsync(Guid id, UpsertPetRequest req, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
