using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Time;
using VetVik.Modules.Pets.Application.DTOs;
using VetVik.Modules.Pets.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Pets.Application.Services;

internal sealed class PetService : IPetService
{
    private readonly VetVikDbContext _db;
    private readonly IClock _clock;

    public PetService(VetVikDbContext db, IClock clock) { _db = db; _clock = clock; }

    public async Task<IReadOnlyList<PetResponse>> GetAllAsync(CancellationToken ct) =>
        await Query(_db.Pets.AsNoTracking()).ToListAsync(ct);

    public async Task<IReadOnlyList<PetResponse>> GetByOwnerAsync(Guid ownerId, CancellationToken ct) =>
        await Query(_db.Pets.AsNoTracking().Where(p => p.OwnerId == ownerId)).ToListAsync(ct);

    public async Task<IReadOnlyList<PetResponse>> GetForCurrentOwnerAsync(string userId, CancellationToken ct)
    {
        var owner = await _db.OwnerProfiles.AsNoTracking().FirstOrDefaultAsync(o => o.UserId == userId, ct)
            ?? throw new NotFoundException("OwnerProfile", userId);
        return await Query(_db.Pets.AsNoTracking().Where(p => p.OwnerId == owner.Id)).ToListAsync(ct);
    }

    public async Task<PetResponse> GetAsync(Guid id, CancellationToken ct)
    {
        var p = await Query(_db.Pets.AsNoTracking().Where(p => p.Id == id)).FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException("Pet", id);
        return p;
    }

    public async Task<PetResponse> CreateAsync(UpsertPetRequest r, CancellationToken ct)
    {
        if (r.OwnerId == Guid.Empty)
            throw new BusinessRuleException("Owner is required.");

        await EnsureValidReferencesAsync(r, ct);
        var pet = new Pet
        {
            OwnerId = r.OwnerId,
            SpeciesId = r.SpeciesId,
            BreedId = r.BreedId,
            Name = r.Name,
            Sex = r.Sex,
            BirthDate = r.BirthDate,
            Weight = r.Weight,
            PhotoUrl = r.PhotoUrl,
            Notes = r.Notes
        };
        _db.Pets.Add(pet);
        await _db.SaveChangesAsync(ct);
        return await GetAsync(pet.Id, ct);
    }

    public async Task<PetResponse> CreateForCurrentOwnerAsync(string userId, CreatePetMineRequest r, CancellationToken ct)
    {
        var owner = await _db.OwnerProfiles.AsNoTracking().FirstOrDefaultAsync(o => o.UserId == userId, ct)
            ?? throw new NotFoundException("OwnerProfile", userId);

        var fixedReq = new UpsertPetRequest(
            owner.Id,
            r.SpeciesId,
            r.BreedId,
            r.Name,
            r.Sex,
            r.BirthDate,
            r.Weight,
            r.PhotoUrl,
            r.Notes);
        return await CreateAsync(fixedReq, ct);
    }

    public async Task<PetResponse> UpdateAsync(Guid id, UpsertPetRequest r, CancellationToken ct)
    {
        var pet = await _db.Pets.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException("Pet", id);

        await EnsureValidReferencesAsync(r, ct);

        pet.OwnerId = r.OwnerId;
        pet.SpeciesId = r.SpeciesId;
        pet.BreedId = r.BreedId;
        pet.Name = r.Name;
        pet.Sex = r.Sex;
        pet.BirthDate = r.BirthDate;
        pet.Weight = r.Weight;
        pet.PhotoUrl = r.PhotoUrl;
        pet.Notes = r.Notes;
        pet.UpdatedAt = _clock.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetAsync(pet.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var pet = await _db.Pets.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException("Pet", id);

        var inUse = await _db.Appointments.AnyAsync(a => a.PetId == id, ct);
        if (inUse)
            throw new ConflictException("Cannot delete a pet that has appointments. Archive on the client side instead.");

        _db.Pets.Remove(pet);
        await _db.SaveChangesAsync(ct);
    }

    private async Task EnsureValidReferencesAsync(UpsertPetRequest r, CancellationToken ct)
    {
        if (!await _db.OwnerProfiles.AnyAsync(o => o.Id == r.OwnerId, ct))
            throw new NotFoundException("OwnerProfile", r.OwnerId);

        if (!await _db.AnimalSpecies.AnyAsync(s => s.Id == r.SpeciesId, ct))
            throw new NotFoundException("AnimalSpecies", r.SpeciesId);

        if (r.BreedId.HasValue)
        {
            var breed = await _db.Breeds.AsNoTracking().FirstOrDefaultAsync(b => b.Id == r.BreedId, ct)
                ?? throw new NotFoundException("Breed", r.BreedId);

            if (breed.SpeciesId != r.SpeciesId)
                throw new BusinessRuleException("Selected breed does not belong to the selected species.");
        }
    }

    private IQueryable<PetResponse> Query(IQueryable<Pet> pets) =>
        pets
            .OrderBy(p => p.Name)
            .Select(p => new PetResponse(
                p.Id,
                p.OwnerId,
                (p.Owner!.FirstName + " " + p.Owner.LastName).Trim(),
                p.SpeciesId,
                p.Species!.Name,
                p.BreedId,
                p.Breed != null ? p.Breed.Name : null,
                p.Name,
                p.Sex,
                p.BirthDate,
                p.Weight,
                p.PhotoUrl,
                p.Notes,
                p.CreatedAt,
                p.UpdatedAt));
}
