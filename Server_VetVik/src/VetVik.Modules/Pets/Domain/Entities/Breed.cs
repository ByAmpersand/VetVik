using VetVik.BuildingBlocks.Domain;

namespace VetVik.Modules.Pets.Domain.Entities;

public class Breed : BaseEntity, ISoftActivatable
{
    public Guid SpeciesId { get; set; }
    public AnimalSpecies? Species { get; set; }

    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
