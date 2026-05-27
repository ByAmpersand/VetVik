namespace VetVik.Modules.Identity.Application.DTOs;

public sealed record InboxNotificationResponse(
    Guid Id,
    string Title,
    string Message,
    string Category,
    string? LinkPath,
    Guid? RelatedEntityId,
    bool IsRead,
    DateTime CreatedAtUtc);

public sealed record InboxNotificationsSummaryResponse(
    IReadOnlyList<InboxNotificationResponse> Items,
    int UnreadCount);
