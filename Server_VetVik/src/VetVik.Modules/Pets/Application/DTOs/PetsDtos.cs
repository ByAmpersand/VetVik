using VetVik.Modules.Pets.Domain.Enums;

namespace VetVik.Modules.Pets.Application.DTOs;

public sealed record AnimalSpeciesResponse(Guid Id, string Name, string? Description, bool IsActive);
public sealed record UpsertAnimalSpeciesRequest(string Name, string? Description, bool IsActive);

public sealed record BreedResponse(Guid Id, Guid SpeciesId, string SpeciesName, string Name, bool IsActive);
public sealed record UpsertBreedRequest(Guid SpeciesId, string Name, bool IsActive);

public sealed record PetResponse(
    Guid Id,
    Guid OwnerId,
    string OwnerFullName,
    Guid SpeciesId,
    string SpeciesName,
    Guid? BreedId,
    string? BreedName,
    string Name,
    PetSex Sex,
    DateOnly? BirthDate,
    decimal? Weight,
    string? PhotoUrl,
    string? Notes,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record UpsertPetRequest(
    Guid OwnerId,
    Guid SpeciesId,
    Guid? BreedId,
    string Name,
    PetSex Sex,
    DateOnly? BirthDate,
    decimal? Weight,
    string? PhotoUrl,
    string? Notes);
