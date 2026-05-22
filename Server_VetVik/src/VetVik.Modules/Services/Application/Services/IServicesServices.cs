using VetVik.Modules.Services.Application.DTOs;

namespace VetVik.Modules.Services.Application.Services;

public interface IServiceCategoryService
{
    Task<IReadOnlyList<ServiceCategoryResponse>> GetAllAsync(bool includeInactive, CancellationToken ct);
    Task<ServiceCategoryResponse> GetAsync(Guid id, CancellationToken ct);
    Task<ServiceCategoryResponse> CreateAsync(UpsertServiceCategoryRequest req, CancellationToken ct);
    Task<ServiceCategoryResponse> UpdateAsync(Guid id, UpsertServiceCategoryRequest req, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public interface IServiceCatalogService
{
    Task<IReadOnlyList<ServiceResponse>> GetAllAsync(Guid? categoryId, bool includeInactive, CancellationToken ct);
    Task<ServiceResponse> GetAsync(Guid id, CancellationToken ct);
    Task<ServiceResponse> CreateAsync(UpsertServiceRequest req, CancellationToken ct);
    Task<ServiceResponse> UpdateAsync(Guid id, UpsertServiceRequest req, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
