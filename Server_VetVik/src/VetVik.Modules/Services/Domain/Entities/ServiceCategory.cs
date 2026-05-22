using VetVik.BuildingBlocks.Domain;

namespace VetVik.Modules.Services.Domain.Entities;

public class ServiceCategory : BaseEntity, ISoftActivatable
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public List<Service> Services { get; set; } = new();
}
