using VetVik.BuildingBlocks.Domain;

namespace VetVik.Modules.Identity.Domain.Entities;

public class AdminProfile : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
