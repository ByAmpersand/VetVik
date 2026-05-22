using Microsoft.EntityFrameworkCore;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Time;
using VetVik.Modules.Pets.Application.DTOs;
using VetVik.Modules.Pets.Domain.Entities;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Pets.Application.Services;

internal sealed class VaccinationService : IVaccinationService
{
    private readonly VetVikDbContext _db;
    private readonly IClock _clock;

    public VaccinationService(VetVikDbContext db, IClock clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<IReadOnlyList<VaccinationResponse>> GetByPetAsync(Guid petId, CancellationToken ct) =>
        await Query(_db.Vaccinations.AsNoTracking().Where(v => v.PetId == petId)).ToListAsync(ct);

    public async Task<IReadOnlyList<VaccinationResponse>> GetForCurrentOwnerAsync(string userId, CancellationToken ct)
    {
        var owner = await _db.OwnerProfiles.AsNoTracking().FirstOrDefaultAsync(o => o.UserId == userId, ct)
            ?? throw new NotFoundException("OwnerProfile", userId);

        var ownerPetIds = _db.Pets.AsNoTracking()
            .Where(p => p.OwnerId == owner.Id)
            .Select(p => p.Id);

        return await Query(_db.Vaccinations.AsNoTracking().Where(v => ownerPetIds.Contains(v.PetId)))
            .ToListAsync(ct);
    }

    public async Task<VaccinationResponse> CreateAsync(UpsertVaccinationRequest request, CancellationToken ct)
    {
        await EnsurePetExistsAsync(request.PetId, ct);

        var vaccination = new Vaccination
        {
            PetId = request.PetId,
            VaccineName = request.VaccineName,
            AdministeredDate = request.AdministeredDate,
            NextDueDate = request.NextDueDate,
            AdministeredByDoctorId = request.AdministeredByDoctorId
        };

        _db.Vaccinations.Add(vaccination);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(vaccination.Id, ct);
    }

    public async Task<VaccinationResponse> UpdateAsync(Guid id, UpsertVaccinationRequest request, CancellationToken ct)
    {
        var vaccination = await _db.Vaccinations.FirstOrDefaultAsync(v => v.Id == id, ct)
            ?? throw new NotFoundException("Vaccination", id);

        await EnsurePetExistsAsync(request.PetId, ct);

        vaccination.PetId = request.PetId;
        vaccination.VaccineName = request.VaccineName;
        vaccination.AdministeredDate = request.AdministeredDate;
        vaccination.NextDueDate = request.NextDueDate;
        vaccination.AdministeredByDoctorId = request.AdministeredByDoctorId;
        vaccination.UpdatedAt = _clock.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var vaccination = await _db.Vaccinations.FirstOrDefaultAsync(v => v.Id == id, ct)
            ?? throw new NotFoundException("Vaccination", id);

        _db.Vaccinations.Remove(vaccination);
        await _db.SaveChangesAsync(ct);
    }

    private async Task EnsurePetExistsAsync(Guid petId, CancellationToken ct)
    {
        if (!await _db.Pets.AnyAsync(p => p.Id == petId, ct))
            throw new NotFoundException("Pet", petId);
    }

    private async Task<VaccinationResponse> GetByIdAsync(Guid id, CancellationToken ct) =>
        await Query(_db.Vaccinations.AsNoTracking().Where(v => v.Id == id)).FirstAsync(ct);

    private IQueryable<VaccinationResponse> Query(IQueryable<Vaccination> vaccinations)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        return vaccinations.AsNoTracking()
            .OrderBy(v => v.NextDueDate)
            .Select(v => new VaccinationResponse(
                v.Id,
                v.PetId,
                v.Pet!.Name,
                v.VaccineName,
                v.AdministeredDate,
                v.NextDueDate,
                v.NextDueDate < today
                    ? "Overdue"
                    : v.NextDueDate <= today.AddDays(30)
                        ? "Due soon"
                        : "Up to date",
                v.AdministeredByDoctor != null
                    ? (v.AdministeredByDoctor.FirstName + " " + v.AdministeredByDoctor.LastName).Trim()
                    : null));
    }
}
