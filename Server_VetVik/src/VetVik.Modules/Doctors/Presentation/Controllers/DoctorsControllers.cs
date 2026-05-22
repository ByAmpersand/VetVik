using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Doctors.Application.DTOs;
using VetVik.Modules.Doctors.Application.Services;

namespace VetVik.Modules.Doctors.Presentation.Controllers;

[ApiController]
[Route("api/doctors")]
[Authorize]
public sealed class DoctorsController : ControllerBase
{
    private readonly IDoctorService _service;
    private readonly IDoctorWorkingHoursService _hours;

    public DoctorsController(IDoctorService service, IDoctorWorkingHoursService hours)
    {
        _service = service; _hours = hours;
    }

    [HttpGet]
    public Task<IReadOnlyList<DoctorResponse>> GetAll(
        [FromQuery] bool includeInactive = false,
        [FromQuery] Guid? specializationId = null,
        CancellationToken ct = default) =>
        _service.GetAllAsync(includeInactive, specializationId, ct);

    [HttpGet("{id:guid}")]
    public Task<DoctorResponse> Get(Guid id, CancellationToken ct) => _service.GetAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<DoctorResponse>> Create([FromBody] CreateDoctorRequest req, CancellationToken ct)
    {
        var x = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public Task<DoctorResponse> Update(Guid id, [FromBody] UpdateDoctorRequest req, CancellationToken ct) =>
        _service.UpdateAsync(id, req, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/specializations/{specializationId:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public Task<DoctorResponse> AssignSpecialization(Guid id, Guid specializationId, CancellationToken ct) =>
        _service.AssignSpecializationAsync(id, specializationId, ct);

    [HttpDelete("{id:guid}/specializations/{specializationId:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public Task<DoctorResponse> RemoveSpecialization(Guid id, Guid specializationId, CancellationToken ct) =>
        _service.RemoveSpecializationAsync(id, specializationId, ct);

    [HttpGet("{id:guid}/working-hours")]
    public Task<IReadOnlyList<DoctorWorkingHourResponse>> GetWorkingHours(Guid id, CancellationToken ct) =>
        _hours.GetForDoctorAsync(id, ct);

    [HttpPut("{id:guid}/working-hours")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Doctor}")]
    public Task<IReadOnlyList<DoctorWorkingHourResponse>> ReplaceWorkingHours(
        Guid id, [FromBody] IReadOnlyList<UpsertDoctorWorkingHourRequest> requests, CancellationToken ct) =>
        _hours.ReplaceForDoctorAsync(id, requests, ct);
}

[ApiController]
[Route("api/specializations")]
[Authorize]
public sealed class SpecializationsController : ControllerBase
{
    private readonly ISpecializationService _service;
    public SpecializationsController(ISpecializationService service) => _service = service;

    [HttpGet]
    public Task<IReadOnlyList<SpecializationResponse>> GetAll(
        [FromQuery] bool includeInactive = false, CancellationToken ct = default) =>
        _service.GetAllAsync(includeInactive, ct);

    [HttpGet("{id:guid}")]
    public Task<SpecializationResponse> Get(Guid id, CancellationToken ct) => _service.GetAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<SpecializationResponse>> Create(
        [FromBody] UpsertSpecializationRequest req, CancellationToken ct)
    {
        var x = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public Task<SpecializationResponse> Update(
        Guid id, [FromBody] UpsertSpecializationRequest req, CancellationToken ct) =>
        _service.UpdateAsync(id, req, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
