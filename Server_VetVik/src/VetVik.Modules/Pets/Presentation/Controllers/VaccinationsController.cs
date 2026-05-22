using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Pets.Application.DTOs;
using VetVik.Modules.Pets.Application.Services;

namespace VetVik.Modules.Pets.Presentation.Controllers;

[ApiController]
[Route("api/vaccinations")]
[Authorize]
public sealed class VaccinationsController : ControllerBase
{
    private readonly IVaccinationService _service;
    private readonly ICurrentUser _currentUser;

    public VaccinationsController(IVaccinationService service, ICurrentUser currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet("by-pet/{petId:guid}")]
    public Task<IReadOnlyList<VaccinationResponse>> ByPet(Guid petId, CancellationToken ct) =>
        _service.GetByPetAsync(petId, ct);

    [HttpGet("mine")]
    [Authorize(Roles = Roles.Owner)]
    public Task<IReadOnlyList<VaccinationResponse>> Mine(CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
            throw new ForbiddenException("Authentication required.");
        return _service.GetForCurrentOwnerAsync(_currentUser.UserId, ct);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public async Task<ActionResult<VaccinationResponse>> Create(
        [FromBody] UpsertVaccinationRequest request, CancellationToken ct)
    {
        var created = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(ByPet), new { petId = created.PetId }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<VaccinationResponse> Update(
        Guid id, [FromBody] UpsertVaccinationRequest request, CancellationToken ct) =>
        _service.UpdateAsync(id, request, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
