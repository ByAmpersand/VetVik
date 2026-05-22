using Microsoft.AspNetCore.Identity;

namespace VetVik.Modules.Identity.Domain.Entities;

/// <summary>
/// Extends IdentityUser with general-purpose account metadata only.
/// Business data (names, addresses, bio, etc.) lives in role-specific profile tables.
/// </summary>
public class ApplicationUser : IdentityUser
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
}
