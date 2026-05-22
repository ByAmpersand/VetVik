using VetVik.BuildingBlocks.Domain;

namespace VetVik.Modules.Pets.Domain.Entities;

public class AnimalSpecies : BaseEntity, ISoftActivatable
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public List<Breed> Breeds { get; set; } = new();
}
