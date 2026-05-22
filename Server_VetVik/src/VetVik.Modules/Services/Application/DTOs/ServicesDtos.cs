namespace VetVik.Modules.Services.Application.DTOs;

public sealed record ServiceCategoryResponse(Guid Id, string Name, string? Description, bool IsActive);
public sealed record UpsertServiceCategoryRequest(string Name, string? Description, bool IsActive);

public sealed record ServiceResponse(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    string Name,
    string? Description,
    int DurationMinutes,
    decimal Price,
    bool IsActive);

public sealed record UpsertServiceRequest(
    Guid CategoryId,
    string Name,
    string? Description,
    int DurationMinutes,
    decimal Price,
    bool IsActive);
