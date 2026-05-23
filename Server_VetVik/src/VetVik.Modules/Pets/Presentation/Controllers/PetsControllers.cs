using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Pets.Application.DTOs;
using VetVik.Modules.Pets.Application.Services;

namespace VetVik.Modules.Pets.Presentation.Controllers;

[ApiController]
[Route("api/species")]
[Authorize]
public sealed class AnimalSpeciesController : ControllerBase
{
    private readonly IAnimalSpeciesService _service;
    public AnimalSpeciesController(IAnimalSpeciesService service) => _service = service;

    [HttpGet]
    public Task<IReadOnlyList<AnimalSpeciesResponse>> GetAll(
        [FromQuery] bool includeInactive = false, CancellationToken ct = default) =>
        _service.GetAllAsync(includeInactive, ct);

    [HttpGet("{id:guid}")]
    public Task<AnimalSpeciesResponse> Get(Guid id, CancellationToken ct) => _service.GetAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public async Task<ActionResult<AnimalSpeciesResponse>> Create(
        [FromBody] UpsertAnimalSpeciesRequest req, CancellationToken ct)
    {
        var x = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public Task<AnimalSpeciesResponse> Update(Guid id, [FromBody] UpsertAnimalSpeciesRequest req, CancellationToken ct) =>
        _service.UpdateAsync(id, req, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}

[ApiController]
[Route("api/breeds")]
[Authorize]
public sealed class BreedsController : ControllerBase
{
    private readonly IBreedService _service;
    public BreedsController(IBreedService service) => _service = service;

    [HttpGet]
    public Task<IReadOnlyList<BreedResponse>> GetAll(
        [FromQuery] Guid? speciesId, [FromQuery] bool includeInactive = false, CancellationToken ct = default) =>
        _service.GetAllAsync(speciesId, includeInactive, ct);

    [HttpGet("{id:guid}")]
    public Task<BreedResponse> Get(Guid id, CancellationToken ct) => _service.GetAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public async Task<ActionResult<BreedResponse>> Create([FromBody] UpsertBreedRequest req, CancellationToken ct)
    {
        var x = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public Task<BreedResponse> Update(Guid id, [FromBody] UpsertBreedRequest req, CancellationToken ct) =>
        _service.UpdateAsync(id, req, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}

[ApiController]
[Route("api/pets")]
[Authorize]
public sealed class PetsController : ControllerBase
{
    private readonly IPetService _service;
    private readonly ICurrentUser _currentUser;

    public PetsController(IPetService service, ICurrentUser currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<IReadOnlyList<PetResponse>> GetAll(CancellationToken ct) => _service.GetAllAsync(ct);

    /// <summary>Pets visible to the current authenticated owner.</summary>
    [HttpGet("mine")]
    [Authorize(Roles = Roles.Owner)]
    public Task<IReadOnlyList<PetResponse>> Mine(CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId)) throw new ForbiddenException("Authentication required.");
        return _service.GetForCurrentOwnerAsync(_currentUser.UserId, ct);
    }

    [HttpGet("by-owner/{ownerId:guid}")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<IReadOnlyList<PetResponse>> ByOwner(Guid ownerId, CancellationToken ct) =>
        _service.GetByOwnerAsync(ownerId, ct);

    [HttpGet("{id:guid}")]
    public Task<PetResponse> Get(Guid id, CancellationToken ct) => _service.GetAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public async Task<ActionResult<PetResponse>> Create([FromBody] UpsertPetRequest req, CancellationToken ct)
    {
        var x = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPost("mine")]
    [Authorize(Roles = Roles.Owner)]
    public async Task<ActionResult<PetResponse>> CreateMine([FromBody] CreatePetMineRequest req, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId)) throw new ForbiddenException("Authentication required.");
        var x = await _service.CreateForCurrentOwnerAsync(_currentUser.UserId, req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Owner}")]
    public Task<PetResponse> Update(Guid id, [FromBody] UpsertPetRequest req, CancellationToken ct) =>
        _service.UpdateAsync(id, req, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.ClinicAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
