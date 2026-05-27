using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Identity.Application.DTOs;
using VetVik.Modules.Identity.Application.Services;

namespace VetVik.Modules.Identity.Presentation.Controllers;

[ApiController]
[Route("api/staff")]
[Authorize(Roles = Roles.ClinicAdmin)]
public sealed class StaffController : ControllerBase
{
    private readonly IStaffService _service;
    private readonly ICurrentUser _currentUser;

    public StaffController(IStaffService service, ICurrentUser currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    public Task<IReadOnlyList<StaffMemberResponse>> GetAll(CancellationToken ct) =>
        _service.GetAllAsync(ct);

    [HttpPost("admins")]
    [Authorize(Roles = Roles.SuperAdmin)]
    public Task<StaffMemberResponse> CreateAdmin([FromBody] CreateAdminRequest request, CancellationToken ct) =>
        _service.CreateAdminAsync(request, ct);

    [HttpPost("doctors")]
    public Task<StaffMemberResponse> CreateDoctor([FromBody] CreateDoctorStaffRequest request, CancellationToken ct) =>
        _service.CreateDoctorAsync(request, ct);

    [HttpDelete("{userId}")]
    public Task<IActionResult> Delete(string userId, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
            throw new ForbiddenException("Authentication required.");
        return DeleteInternal(userId, ct);
    }

    private async Task<IActionResult> DeleteInternal(string userId, CancellationToken ct)
    {
        await _service.DeleteAsync(userId, _currentUser.UserId!, ct);
        return NoContent();
    }
}

[ApiController]
[Route("api/clients")]
[Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
public sealed class ClientsController : ControllerBase
{
    private readonly IClientDirectoryService _service;

    public ClientsController(IClientDirectoryService service) => _service = service;

    [HttpGet]
    public Task<IReadOnlyList<ClientDirectoryResponse>> GetAll(CancellationToken ct) =>
        _service.GetAllAsync(ct);
}

[ApiController]
[Route("api/analytics")]
[Authorize(Roles = Roles.ClinicAdmin)]
public sealed class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _service;

    public AnalyticsController(IAnalyticsService service) => _service = service;

    [HttpGet("admin-insights")]
    public Task<AdminInsightsResponse> AdminInsights(CancellationToken ct) =>
        _service.GetAdminInsightsAsync(ct);
}
