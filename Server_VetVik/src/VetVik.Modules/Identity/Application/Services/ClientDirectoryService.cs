using Microsoft.EntityFrameworkCore;
using VetVik.Modules.Appointments.Domain.Enums;
using VetVik.Modules.Identity.Application.DTOs;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Identity.Application.Services;

internal sealed class ClientDirectoryService : IClientDirectoryService
{
    private readonly VetVikDbContext _db;

    public ClientDirectoryService(VetVikDbContext db) => _db = db;

    public async Task<IReadOnlyList<ClientDirectoryResponse>> GetAllAsync(CancellationToken ct)
    {
        var owners = await _db.OwnerProfiles.AsNoTracking()
            .Include(o => o.User)
            .OrderBy(o => o.LastName)
            .ThenBy(o => o.FirstName)
            .ToListAsync(ct);

        var petCounts = await _db.Pets.AsNoTracking()
            .GroupBy(p => p.OwnerId)
            .Select(g => new { OwnerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.OwnerId, x => x.Count, ct);

        var lastAppointments = await _db.Appointments.AsNoTracking()
            .Where(a => a.Status != AppointmentStatus.Cancelled)
            .GroupBy(a => a.OwnerId)
            .Select(g => new { OwnerId = g.Key, LastAt = g.Max(a => a.StartAt) })
            .ToDictionaryAsync(x => x.OwnerId, x => x.LastAt, ct);

        return owners.Select(o => new ClientDirectoryResponse(
            o.Id,
            o.UserId,
            o.User?.Email ?? string.Empty,
            o.FirstName,
            o.LastName,
            o.User?.PhoneNumber,
            petCounts.GetValueOrDefault(o.Id),
            lastAppointments.GetValueOrDefault(o.Id))).ToList();
    }
}
