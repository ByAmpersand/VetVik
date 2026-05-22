using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.Modules.Pets.Application.DTOs;
using VetVik.Modules.Pets.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Pets.Application.Services;

internal sealed class BreedService : IBreedService
{
    private readonly VetVikDbContext _db;
    public BreedService(VetVikDbContext db) => _db = db;

    public async Task<IReadOnlyList<BreedResponse>> GetAllAsync(Guid? speciesId, bool includeInactive, CancellationToken ct)
    {
        var q = _db.Breeds.AsNoTracking().Include(b => b.Species).AsQueryable();
        if (speciesId.HasValue) q = q.Where(b => b.SpeciesId == speciesId.Value);
        if (!includeInactive) q = q.Where(b => b.IsActive);
        return await q.OrderBy(b => b.Species!.Name).ThenBy(b => b.Name)
            .Select(b => new BreedResponse(b.Id, b.SpeciesId, b.Species!.Name, b.Name, b.IsActive))
            .ToListAsync(ct);
    }

    public async Task<BreedResponse> GetAsync(Guid id, CancellationToken ct)
    {
        var b = await _db.Breeds.AsNoTracking().Include(x => x.Species).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Breed", id);
        return new BreedResponse(b.Id, b.SpeciesId, b.Species!.Name, b.Name, b.IsActive);
    }

    public async Task<BreedResponse> CreateAsync(UpsertBreedRequest r, CancellationToken ct)
    {
        var species = await _db.AnimalSpecies.FirstOrDefaultAsync(s => s.Id == r.SpeciesId, ct)
            ?? throw new NotFoundException("AnimalSpecies", r.SpeciesId);

        if (await _db.Breeds.AnyAsync(b => b.SpeciesId == r.SpeciesId && b.Name == r.Name, ct))
            throw new ConflictException($"Breed '{r.Name}' already exists for this species.");

        var breed = new Breed { SpeciesId = species.Id, Name = r.Name, IsActive = r.IsActive };
        _db.Breeds.Add(breed);
        await _db.SaveChangesAsync(ct);
        return new BreedResponse(breed.Id, species.Id, species.Name, breed.Name, breed.IsActive);
    }

    public async Task<BreedResponse> UpdateAsync(Guid id, UpsertBreedRequest r, CancellationToken ct)
    {
        var breed = await _db.Breeds.Include(b => b.Species).FirstOrDefaultAsync(b => b.Id == id, ct)
            ?? throw new NotFoundException("Breed", id);

        if (breed.SpeciesId != r.SpeciesId)
        {
            var newSpecies = await _db.AnimalSpecies.FirstOrDefaultAsync(s => s.Id == r.SpeciesId, ct)
                ?? throw new NotFoundException("AnimalSpecies", r.SpeciesId);
            breed.SpeciesId = newSpecies.Id;
            breed.Species = newSpecies;
        }

        if (await _db.Breeds.AnyAsync(b => b.Id != id && b.SpeciesId == r.SpeciesId && b.Name == r.Name, ct))
            throw new ConflictException($"Breed '{r.Name}' already exists for this species.");

        breed.Name = r.Name;
        breed.IsActive = r.IsActive;
        await _db.SaveChangesAsync(ct);

        return new BreedResponse(breed.Id, breed.SpeciesId, breed.Species!.Name, breed.Name, breed.IsActive);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var b = await _db.Breeds.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Breed", id);

        var inUse = await _db.Pets.AnyAsync(p => p.BreedId == id, ct);
        if (inUse)
        {
            b.IsActive = false;
            await _db.SaveChangesAsync(ct);
            return;
        }
        _db.Breeds.Remove(b);
        await _db.SaveChangesAsync(ct);
    }
}
