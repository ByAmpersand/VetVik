using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.MedicalRecords.Application.DTOs;
using VetVik.Modules.MedicalRecords.Application.Services;

namespace VetVik.Modules.MedicalRecords.Presentation.Controllers;

[ApiController]
[Route("api/medical-records")]
[Authorize]
public sealed class MedicalRecordsController : ControllerBase
{
    private readonly IMedicalRecordService _service;
    public MedicalRecordsController(IMedicalRecordService service) => _service = service;

    [HttpGet("{id:guid}")]
    public Task<MedicalRecordResponse> Get(Guid id, CancellationToken ct) => _service.GetAsync(id, ct);

    [HttpGet("by-appointment/{appointmentId:guid}")]
    public async Task<ActionResult<MedicalRecordResponse>> ByAppointment(Guid appointmentId, CancellationToken ct)
    {
        var r = await _service.GetByAppointmentAsync(appointmentId, ct);
        return r is null ? NotFound() : Ok(r);
    }

    [HttpGet("by-pet/{petId:guid}")]
    public Task<IReadOnlyList<MedicalRecordResponse>> ByPet(Guid petId, CancellationToken ct) =>
        _service.GetByPetAsync(petId, ct);

    [HttpPost]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public async Task<ActionResult<MedicalRecordResponse>> Create(
        [FromBody] CreateMedicalRecordRequest req, CancellationToken ct)
    {
        var x = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<MedicalRecordResponse> Update(
        Guid id, [FromBody] UpdateMedicalRecordRequest req, CancellationToken ct) =>
        _service.UpdateAsync(id, req, ct);
}
