using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.Modules.Pets.Application.DTOs;
using VetVik.Modules.Pets.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Pets.Application.Services;

internal sealed class AnimalSpeciesService : IAnimalSpeciesService
{
    private readonly VetVikDbContext _db;
    public AnimalSpeciesService(VetVikDbContext db) => _db = db;

    public async Task<IReadOnlyList<AnimalSpeciesResponse>> GetAllAsync(bool includeInactive, CancellationToken ct)
    {
        var q = _db.AnimalSpecies.AsNoTracking();
        if (!includeInactive) q = q.Where(x => x.IsActive);
        return await q.OrderBy(x => x.Name)
            .Select(x => new AnimalSpeciesResponse(x.Id, x.Name, x.Description, x.IsActive))
            .ToListAsync(ct);
    }

    public async Task<AnimalSpeciesResponse> GetAsync(Guid id, CancellationToken ct)
    {
        var x = await _db.AnimalSpecies.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException("AnimalSpecies", id);
        return new AnimalSpeciesResponse(x.Id, x.Name, x.Description, x.IsActive);
    }

    public async Task<AnimalSpeciesResponse> CreateAsync(UpsertAnimalSpeciesRequest r, CancellationToken ct)
    {
        if (await _db.AnimalSpecies.AnyAsync(s => s.Name == r.Name, ct))
            throw new ConflictException($"Species '{r.Name}' already exists.");

        var s = new AnimalSpecies { Name = r.Name, Description = r.Description, IsActive = r.IsActive };
        _db.AnimalSpecies.Add(s);
        await _db.SaveChangesAsync(ct);
        return new AnimalSpeciesResponse(s.Id, s.Name, s.Description, s.IsActive);
    }

    public async Task<AnimalSpeciesResponse> UpdateAsync(Guid id, UpsertAnimalSpeciesRequest r, CancellationToken ct)
    {
        var s = await _db.AnimalSpecies.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("AnimalSpecies", id);

        if (await _db.AnimalSpecies.AnyAsync(x => x.Id != id && x.Name == r.Name, ct))
            throw new ConflictException($"Species '{r.Name}' already exists.");

        s.Name = r.Name;
        s.Description = r.Description;
        s.IsActive = r.IsActive;
        await _db.SaveChangesAsync(ct);
        return new AnimalSpeciesResponse(s.Id, s.Name, s.Description, s.IsActive);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var s = await _db.AnimalSpecies.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("AnimalSpecies", id);

        var inUse = await _db.Pets.AnyAsync(p => p.SpeciesId == id, ct) ||
                    await _db.Breeds.AnyAsync(b => b.SpeciesId == id, ct);
        if (inUse)
        {
            s.IsActive = false;
            await _db.SaveChangesAsync(ct);
            return;
        }
        _db.AnimalSpecies.Remove(s);
        await _db.SaveChangesAsync(ct);
    }
}
