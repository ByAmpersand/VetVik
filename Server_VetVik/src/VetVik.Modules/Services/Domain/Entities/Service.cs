using VetVik.BuildingBlocks.Domain;

namespace VetVik.Modules.Services.Domain.Entities;

public class Service : BaseEntity, ISoftActivatable
{
    public Guid CategoryId { get; set; }
    public ServiceCategory? Category { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}
