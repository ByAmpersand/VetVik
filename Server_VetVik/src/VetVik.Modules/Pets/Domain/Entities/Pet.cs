using VetVik.BuildingBlocks.Domain;
using VetVik.Modules.Identity.Domain.Entities;
using VetVik.Modules.Pets.Domain.Enums;

namespace VetVik.Modules.Pets.Domain.Entities;

public class Pet : BaseEntity, IAuditableEntity
{
    public Guid OwnerId { get; set; }
    public OwnerProfile? Owner { get; set; }

    public Guid SpeciesId { get; set; }
    public AnimalSpecies? Species { get; set; }

    public Guid? BreedId { get; set; }
    public Breed? Breed { get; set; }

    public string Name { get; set; } = string.Empty;
    public PetSex Sex { get; set; } = PetSex.Unknown;
    public DateOnly? BirthDate { get; set; }
    public decimal? Weight { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
