using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.Modules.Persistence;
using VetVik.Modules.Services.Application.DTOs;
using ServiceEntity = VetVik.Modules.Services.Domain.Entities.Service;

namespace VetVik.Modules.Services.Application.Services;

internal sealed class ServiceCatalogService : IServiceCatalogService
{
    private readonly VetVikDbContext _db;
    public ServiceCatalogService(VetVikDbContext db) => _db = db;

    public async Task<IReadOnlyList<ServiceResponse>> GetAllAsync(Guid? categoryId, bool includeInactive, CancellationToken ct)
    {
        var q = _db.Services.AsNoTracking().Include(s => s.Category).AsQueryable();
        if (categoryId.HasValue) q = q.Where(s => s.CategoryId == categoryId.Value);
        if (!includeInactive) q = q.Where(s => s.IsActive);

        return await q.OrderBy(s => s.Category!.Name).ThenBy(s => s.Name)
            .Select(s => new ServiceResponse(
                s.Id, s.CategoryId, s.Category!.Name, s.Name, s.Description,
                s.DurationMinutes, s.Price, s.IsActive))
            .ToListAsync(ct);
    }

    public async Task<ServiceResponse> GetAsync(Guid id, CancellationToken ct)
    {
        var s = await _db.Services.AsNoTracking().Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Service", id);
        return Map(s);
    }

    public async Task<ServiceResponse> CreateAsync(UpsertServiceRequest r, CancellationToken ct)
    {
        var cat = await _db.ServiceCategories.FirstOrDefaultAsync(c => c.Id == r.CategoryId, ct)
            ?? throw new NotFoundException("ServiceCategory", r.CategoryId);

        if (await _db.Services.AnyAsync(s => s.CategoryId == r.CategoryId && s.Name == r.Name, ct))
            throw new ConflictException($"Service '{r.Name}' already exists in this category.");

        var s = new ServiceEntity
        {
            CategoryId = cat.Id,
            Name = r.Name,
            Description = r.Description,
            DurationMinutes = r.DurationMinutes,
            Price = r.Price,
            IsActive = r.IsActive
        };
        _db.Services.Add(s);
        await _db.SaveChangesAsync(ct);
        s.Category = cat;
        return Map(s);
    }

    public async Task<ServiceResponse> UpdateAsync(Guid id, UpsertServiceRequest r, CancellationToken ct)
    {
        var s = await _db.Services.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Service", id);

        if (s.CategoryId != r.CategoryId)
        {
            var newCat = await _db.ServiceCategories.FirstOrDefaultAsync(c => c.Id == r.CategoryId, ct)
                ?? throw new NotFoundException("ServiceCategory", r.CategoryId);
            s.CategoryId = newCat.Id;
            s.Category = newCat;
        }

        if (await _db.Services.AnyAsync(x => x.Id != id && x.CategoryId == r.CategoryId && x.Name == r.Name, ct))
            throw new ConflictException($"Service '{r.Name}' already exists in this category.");

        s.Name = r.Name;
        s.Description = r.Description;
        s.DurationMinutes = r.DurationMinutes;
        s.Price = r.Price;
        s.IsActive = r.IsActive;
        await _db.SaveChangesAsync(ct);
        return Map(s);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var s = await _db.Services.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Service", id);
        var inUse = await _db.Appointments.AnyAsync(a => a.ServiceId == id, ct);
        if (inUse)
        {
            s.IsActive = false;
            await _db.SaveChangesAsync(ct);
            return;
        }
        _db.Services.Remove(s);
        await _db.SaveChangesAsync(ct);
    }

    private static ServiceResponse Map(ServiceEntity s) =>
        new(s.Id, s.CategoryId, s.Category!.Name, s.Name, s.Description, s.DurationMinutes, s.Price, s.IsActive);
}
