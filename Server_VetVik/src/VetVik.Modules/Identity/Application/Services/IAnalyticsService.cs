using VetVik.Modules.Identity.Application.DTOs;

namespace VetVik.Modules.Identity.Application.Services;

public interface IAnalyticsService
{
    Task<AdminInsightsResponse> GetAdminInsightsAsync(CancellationToken ct);
}
