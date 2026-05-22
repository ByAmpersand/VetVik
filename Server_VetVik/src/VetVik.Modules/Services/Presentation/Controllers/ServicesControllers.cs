using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Services.Application.DTOs;
using VetVik.Modules.Services.Application.Services;

namespace VetVik.Modules.Services.Presentation.Controllers;

[ApiController]
[Route("api/service-categories")]
[Authorize]
public sealed class ServiceCategoriesController : ControllerBase
{
    private readonly IServiceCategoryService _service;
    public ServiceCategoriesController(IServiceCategoryService service) => _service = service;

    [HttpGet]
    public Task<IReadOnlyList<ServiceCategoryResponse>> GetAll(
        [FromQuery] bool includeInactive = false, CancellationToken ct = default) =>
        _service.GetAllAsync(includeInactive, ct);

    [HttpGet("{id:guid}")]
    public Task<ServiceCategoryResponse> Get(Guid id, CancellationToken ct) => _service.GetAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ServiceCategoryResponse>> Create(
        [FromBody] UpsertServiceCategoryRequest req, CancellationToken ct)
    {
        var x = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public Task<ServiceCategoryResponse> Update(
        Guid id, [FromBody] UpsertServiceCategoryRequest req, CancellationToken ct) =>
        _service.UpdateAsync(id, req, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}

[ApiController]
[Route("api/services")]
[Authorize]
public sealed class ServicesController : ControllerBase
{
    private readonly IServiceCatalogService _service;
    public ServicesController(IServiceCatalogService service) => _service = service;

    [HttpGet]
    public Task<IReadOnlyList<ServiceResponse>> GetAll(
        [FromQuery] Guid? categoryId = null,
        [FromQuery] bool includeInactive = false,
        CancellationToken ct = default) =>
        _service.GetAllAsync(categoryId, includeInactive, ct);

    [HttpGet("{id:guid}")]
    public Task<ServiceResponse> Get(Guid id, CancellationToken ct) => _service.GetAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ServiceResponse>> Create([FromBody] UpsertServiceRequest req, CancellationToken ct)
    {
        var x = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public Task<ServiceResponse> Update(Guid id, [FromBody] UpsertServiceRequest req, CancellationToken ct) =>
        _service.UpdateAsync(id, req, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
