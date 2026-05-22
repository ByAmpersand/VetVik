using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Clinic.Application.DTOs;
using VetVik.Modules.Clinic.Application.Services;

namespace VetVik.Modules.Clinic.Presentation.Controllers;

[ApiController]
[Route("api/clinic")]
[Authorize]
public sealed class ClinicController : ControllerBase
{
    private readonly IClinicService _clinic;
    public ClinicController(IClinicService clinic) => _clinic = clinic;

    [HttpGet("settings")]
    [AllowAnonymous]
    public Task<ClinicSettingsResponse> GetSettings(CancellationToken ct) => _clinic.GetSettingsAsync(ct);

    [HttpPut("settings")]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public Task<ClinicSettingsResponse> UpdateSettings(
        [FromBody] UpdateClinicSettingsRequest request, CancellationToken ct) =>
        _clinic.UpdateSettingsAsync(request, ct);

    [HttpGet("working-hours")]
    [AllowAnonymous]
    public Task<IReadOnlyList<ClinicWorkingHourResponse>> GetWorkingHours(CancellationToken ct) =>
        _clinic.GetWorkingHoursAsync(ct);

    [HttpPut("working-hours")]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public Task<IReadOnlyList<ClinicWorkingHourResponse>> ReplaceWorkingHours(
        [FromBody] IReadOnlyList<UpsertClinicWorkingHourRequest> requests, CancellationToken ct) =>
        _clinic.ReplaceWorkingHoursAsync(requests, ct);
}

[ApiController]
[Route("api/rooms")]
[Authorize]
public sealed class RoomsController : ControllerBase
{
    private readonly IClinicService _clinic;
    public RoomsController(IClinicService clinic) => _clinic = clinic;

    [HttpGet]
    public Task<IReadOnlyList<RoomResponse>> GetAll(
        [FromQuery] bool includeInactive = false, CancellationToken ct = default) =>
        _clinic.GetRoomsAsync(includeInactive, ct);

    [HttpGet("{id:guid}")]
    public Task<RoomResponse> Get(Guid id, CancellationToken ct) => _clinic.GetRoomAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public async Task<ActionResult<RoomResponse>> Create([FromBody] UpsertRoomRequest req, CancellationToken ct)
    {
        var created = await _clinic.CreateRoomAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public Task<RoomResponse> Update(Guid id, [FromBody] UpsertRoomRequest req, CancellationToken ct) =>
        _clinic.UpdateRoomAsync(id, req, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _clinic.DeleteRoomAsync(id, ct);
        return NoContent();
    }
}
