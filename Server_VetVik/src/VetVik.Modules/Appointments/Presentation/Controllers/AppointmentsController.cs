using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Appointments.Application.DTOs;
using VetVik.Modules.Appointments.Application.Services;

namespace VetVik.Modules.Appointments.Presentation.Controllers;

[ApiController]
[Route("api/appointments")]
[Authorize]
public sealed class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _service;
    private readonly ICurrentUser _currentUser;

    public AppointmentsController(IAppointmentService service, ICurrentUser currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet("{id:guid}")]
    public Task<AppointmentResponse> Get(Guid id, CancellationToken ct) => _service.GetAsync(id, ct);

    [HttpGet("by-owner/{ownerId:guid}")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<IReadOnlyList<AppointmentResponse>> ByOwner(Guid ownerId, CancellationToken ct) =>
        _service.GetByOwnerAsync(ownerId, ct);

    [HttpGet("by-doctor/{doctorId:guid}")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<IReadOnlyList<AppointmentResponse>> ByDoctor(Guid doctorId, CancellationToken ct) =>
        _service.GetByDoctorAsync(doctorId, ct);

    [HttpGet("mine")]
    [Authorize(Roles = Roles.Owner)]
    public Task<IReadOnlyList<AppointmentResponse>> Mine(CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId)) throw new ForbiddenException("Authentication required.");
        return _service.GetForCurrentOwnerAsync(_currentUser.UserId, ct);
    }

    [HttpGet("doctor/mine")]
    [Authorize(Roles = Roles.Doctor)]
    public Task<IReadOnlyList<AppointmentResponse>> MineDoctor(CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId)) throw new ForbiddenException("Authentication required.");
        return _service.GetForCurrentDoctorAsync(_currentUser.UserId, ct);
    }

    [HttpGet("range")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<IReadOnlyList<AppointmentResponse>> ByRange(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] Guid? doctorId = null,
        [FromQuery] Guid? roomId = null,
        CancellationToken ct = default) =>
        _service.GetByDateRangeAsync(from, to, doctorId, roomId, ct);

    [HttpGet("calendar")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<IReadOnlyList<AppointmentResponse>> Calendar(
        [FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken ct) =>
        _service.GetCalendarAsync(from, to, ct);

    [HttpPost("available-slots")]
    public Task<IReadOnlyList<AvailableAppointmentSlotResponse>> FindAvailableSlots(
        [FromBody] FindAvailableAppointmentSlotsRequest req,
        CancellationToken ct) =>
        _service.FindAvailableSlotsAsync(req, ct);

    [HttpPost]
    public async Task<ActionResult<AppointmentResponse>> Create(
        [FromBody] CreateAppointmentRequest req, CancellationToken ct)
    {
        var actingIsOwner = _currentUser.IsInRole(Roles.Owner)
            && !_currentUser.IsInRole(Roles.Admin)
            && !_currentUser.IsInRole(Roles.SuperAdmin);
        var created = await _service.CreateAsync(req, _currentUser.UserId, actingIsOwner, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<AppointmentResponse> Update(
        Guid id, [FromBody] UpdateAppointmentRequest req, CancellationToken ct) =>
        _service.UpdateAsync(id, req, ct);

    [HttpPost("{id:guid}/cancel")]
    public Task<AppointmentResponse> Cancel(
        Guid id, [FromBody] CancelAppointmentRequest req, CancellationToken ct) =>
        _service.CancelAsync(id, req, ct);

    [HttpPost("{id:guid}/confirm")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<AppointmentResponse> Confirm(Guid id, CancellationToken ct) =>
        _service.ConfirmAsync(id, ct);

    [HttpPost("{id:guid}/reject")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<AppointmentResponse> Reject(Guid id, [FromBody] RejectAppointmentRequest req, CancellationToken ct) =>
        _service.RejectAsync(id, req.Reason, ct);

    [HttpPost("{id:guid}/complete")]
    [Authorize(Roles = $"{Roles.ClinicAdmin},{Roles.Doctor}")]
    public Task<AppointmentResponse> Complete(Guid id, CancellationToken ct) =>
        _service.CompleteAsync(id, ct);
}
