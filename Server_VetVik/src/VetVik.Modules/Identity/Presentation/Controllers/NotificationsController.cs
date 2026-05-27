using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetVik.BuildingBlocks.Application.Exceptions;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Identity.Application.DTOs;
using VetVik.Modules.Identity.Application.Services;

namespace VetVik.Modules.Identity.Presentation.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public sealed class NotificationsController : ControllerBase
{
    private readonly INotificationService _notifications;
    private readonly ICurrentUser _currentUser;

    public NotificationsController(INotificationService notifications, ICurrentUser currentUser)
    {
        _notifications = notifications;
        _currentUser = currentUser;
    }

    [HttpGet]
    public Task<InboxNotificationsSummaryResponse> GetInbox([FromQuery] int limit = 20, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
            throw new ForbiddenException("Authentication required.");

        return _notifications.GetInboxAsync(_currentUser.UserId, limit, ct);
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
            throw new ForbiddenException("Authentication required.");

        await _notifications.MarkAsReadAsync(_currentUser.UserId, id, ct);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
            throw new ForbiddenException("Authentication required.");

        await _notifications.MarkAllAsReadAsync(_currentUser.UserId, ct);
        return NoContent();
    }
}
