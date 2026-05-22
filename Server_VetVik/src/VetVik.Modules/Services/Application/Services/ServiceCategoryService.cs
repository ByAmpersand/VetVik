using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.Modules.Persistence;
using VetVik.Modules.Services.Application.DTOs;
using VetVik.Modules.Services.Domain.Entities;

namespace VetVik.Modules.Services.Application.Services;

internal sealed class ServiceCategoryService : IServiceCategoryService
{
    private readonly VetVikDbContext _db;
    public ServiceCategoryService(VetVikDbContext db) => _db = db;

    public async Task<IReadOnlyList<ServiceCategoryResponse>> GetAllAsync(bool includeInactive, CancellationToken ct)
    {
        var q = _db.ServiceCategories.AsNoTracking();
        if (!includeInactive) q = q.Where(c => c.IsActive);
        return await q.OrderBy(c => c.Name)
            .Select(c => new ServiceCategoryResponse(c.Id, c.Name, c.Description, c.IsActive))
            .ToListAsync(ct);
    }

    public async Task<ServiceCategoryResponse> GetAsync(Guid id, CancellationToken ct)
    {
        var c = await _db.ServiceCategories.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("ServiceCategory", id);
        return new ServiceCategoryResponse(c.Id, c.Name, c.Description, c.IsActive);
    }

    public async Task<ServiceCategoryResponse> CreateAsync(UpsertServiceCategoryRequest r, CancellationToken ct)
    {
        if (await _db.ServiceCategories.AnyAsync(c => c.Name == r.Name, ct))
            throw new ConflictException($"Service category '{r.Name}' already exists.");

        var c = new ServiceCategory { Name = r.Name, Description = r.Description, IsActive = r.IsActive };
        _db.ServiceCategories.Add(c);
        await _db.SaveChangesAsync(ct);
        return new ServiceCategoryResponse(c.Id, c.Name, c.Description, c.IsActive);
    }

    public async Task<ServiceCategoryResponse> UpdateAsync(Guid id, UpsertServiceCategoryRequest r, CancellationToken ct)
    {
        var c = await _db.ServiceCategories.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("ServiceCategory", id);
        if (await _db.ServiceCategories.AnyAsync(x => x.Id != id && x.Name == r.Name, ct))
            throw new ConflictException($"Service category '{r.Name}' already exists.");
        c.Name = r.Name; c.Description = r.Description; c.IsActive = r.IsActive;
        await _db.SaveChangesAsync(ct);
        return new ServiceCategoryResponse(c.Id, c.Name, c.Description, c.IsActive);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var c = await _db.ServiceCategories.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("ServiceCategory", id);
        var inUse = await _db.Services.AnyAsync(s => s.CategoryId == id, ct);
        if (inUse)
        {
            c.IsActive = false;
            await _db.SaveChangesAsync(ct);
            return;
        }
        _db.ServiceCategories.Remove(c);
        await _db.SaveChangesAsync(ct);
    }
}
