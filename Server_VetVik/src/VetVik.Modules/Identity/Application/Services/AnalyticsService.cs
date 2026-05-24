using Microsoft.EntityFrameworkCore;
using VetVik.Modules.Appointments.Domain.Enums;
using VetVik.Modules.Identity.Application.DTOs;
using VetVik.Modules.Persistence;

namespace VetVik.Modules.Identity.Application.Services;

internal sealed class AnalyticsService : IAnalyticsService
{
    private readonly VetVikDbContext _db;

    public AnalyticsService(VetVikDbContext db) => _db = db;

    public async Task<AdminInsightsResponse> GetAdminInsightsAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthEnd = monthStart.AddMonths(1);

        var monthAppointments = await _db.Appointments.AsNoTracking()
            .Where(a => a.StartAt >= monthStart && a.StartAt < monthEnd)
            .ToListAsync(ct);

        var completed = monthAppointments.Count(a => a.Status == AppointmentStatus.Completed);
        var cancelled = monthAppointments.Count(a => a.Status == AppointmentStatus.Cancelled);
        var activeDoctors = await _db.DoctorProfiles.AsNoTracking().CountAsync(d => d.IsActive, ct);

        var monthlyTrend = await BuildMonthlyTrendAsync(ct);
        var weeklyWorkload = await BuildWeeklyWorkloadAsync(ct);
        var serviceDistribution = await BuildServiceDistributionAsync(ct);
        var speciesDistribution = await BuildSpeciesDistributionAsync(ct);

        return new AdminInsightsResponse(
            monthAppointments.Count,
            completed,
            cancelled,
            activeDoctors,
            monthlyTrend,
            weeklyWorkload,
            serviceDistribution,
            speciesDistribution);
    }

    private async Task<IReadOnlyList<MonthlyTrendPoint>> BuildMonthlyTrendAsync(CancellationToken ct)
    {
        var from = DateTime.UtcNow.AddMonths(-4);
        var appointments = await _db.Appointments.AsNoTracking()
            .Where(a => a.StartAt >= from)
            .ToListAsync(ct);

        return appointments
            .GroupBy(a => a.StartAt.ToString("MMM"))
            .OrderBy(g => g.Min(a => a.StartAt))
            .Select(g => new MonthlyTrendPoint(
                g.Key,
                g.Count(),
                g.Count(a => a.Status == AppointmentStatus.Completed)))
            .ToList();
    }

    private async Task<IReadOnlyList<WeeklyWorkloadPoint>> BuildWeeklyWorkloadAsync(CancellationToken ct)
    {
        var from = DateTime.UtcNow.Date.AddDays(-6);
        var appointments = await _db.Appointments.AsNoTracking()
            .Where(a => a.StartAt >= from)
            .ToListAsync(ct);

        var days = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
        return days.Select((label, index) =>
        {
            var day = from.AddDays(index);
            var count = appointments.Count(a => a.StartAt.Date == day.Date);
            return new WeeklyWorkloadPoint(label, count);
        }).ToList();
    }

    private async Task<IReadOnlyList<ServiceDistributionPoint>> BuildServiceDistributionAsync(CancellationToken ct)
    {
        var rows = await _db.Appointments.AsNoTracking()
            .Join(
                _db.Services.AsNoTracking(),
                appointment => appointment.ServiceId,
                service => service.Id,
                (appointment, service) => service.Name)
            .GroupBy(name => name)
            .Select(g => new { Name = g.Key, Value = g.Count() })
            .OrderByDescending(x => x.Value)
            .Take(5)
            .ToListAsync(ct);

        return rows.Select(x => new ServiceDistributionPoint(x.Name, x.Value)).ToList();
    }

    private async Task<IReadOnlyList<SpeciesDistributionPoint>> BuildSpeciesDistributionAsync(CancellationToken ct)
    {
        var rows = await _db.Pets.AsNoTracking()
            .Join(
                _db.AnimalSpecies.AsNoTracking(),
                pet => pet.SpeciesId,
                species => species.Id,
                (pet, species) => species.Name)
            .GroupBy(name => name)
            .Select(g => new { Name = g.Key, Value = g.Count() })
            .OrderByDescending(x => x.Value)
            .ToListAsync(ct);

        return rows.Select(x => new SpeciesDistributionPoint(x.Name, x.Value)).ToList();
    }
}
