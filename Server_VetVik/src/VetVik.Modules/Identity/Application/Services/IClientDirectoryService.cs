using VetVik.Modules.Identity.Application.DTOs;

namespace VetVik.Modules.Identity.Application.Services;

public interface IClientDirectoryService
{
    Task<IReadOnlyList<ClientDirectoryResponse>> GetAllAsync(CancellationToken ct);
}
