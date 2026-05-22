using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.Modules.Doctors.Application.DTOs;
using VetVik.Modules.Doctors.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Doctors.Application.Services;

internal sealed class SpecializationService : ISpecializationService
{
    private readonly VetVikDbContext _db;
    public SpecializationService(VetVikDbContext db) => _db = db;

    public async Task<IReadOnlyList<SpecializationResponse>> GetAllAsync(bool includeInactive, CancellationToken ct)
    {
        var q = _db.Specializations.AsNoTracking();
        if (!includeInactive) q = q.Where(s => s.IsActive);
        return await q.OrderBy(s => s.Name)
            .Select(s => new SpecializationResponse(s.Id, s.Name, s.Description, s.IsActive))
            .ToListAsync(ct);
    }

    public async Task<SpecializationResponse> GetAsync(Guid id, CancellationToken ct)
    {
        var s = await _db.Specializations.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Specialization", id);
        return new SpecializationResponse(s.Id, s.Name, s.Description, s.IsActive);
    }

    public async Task<SpecializationResponse> CreateAsync(UpsertSpecializationRequest r, CancellationToken ct)
    {
        if (await _db.Specializations.AnyAsync(s => s.Name == r.Name, ct))
            throw new ConflictException($"Specialization '{r.Name}' already exists.");

        var s = new Specialization { Name = r.Name, Description = r.Description, IsActive = r.IsActive };
        _db.Specializations.Add(s);
        await _db.SaveChangesAsync(ct);
        return new SpecializationResponse(s.Id, s.Name, s.Description, s.IsActive);
    }

    public async Task<SpecializationResponse> UpdateAsync(Guid id, UpsertSpecializationRequest r, CancellationToken ct)
    {
        var s = await _db.Specializations.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Specialization", id);
        if (await _db.Specializations.AnyAsync(x => x.Id != id && x.Name == r.Name, ct))
            throw new ConflictException($"Specialization '{r.Name}' already exists.");
        s.Name = r.Name;
        s.Description = r.Description;
        s.IsActive = r.IsActive;
        await _db.SaveChangesAsync(ct);
        return new SpecializationResponse(s.Id, s.Name, s.Description, s.IsActive);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var s = await _db.Specializations.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Specialization", id);
        var inUse = await _db.DoctorSpecializations.AnyAsync(ds => ds.SpecializationId == id, ct);
        if (inUse)
        {
            s.IsActive = false;
            await _db.SaveChangesAsync(ct);
            return;
        }
        _db.Specializations.Remove(s);
        await _db.SaveChangesAsync(ct);
    }
}
