namespace VetVik.Modules.Persistence;

public sealed class SeedSettings
{
    public const string SectionName = "Seed";

    public SeedUser SuperAdmin { get; set; } = new();
    public SeedUser Admin { get; set; } = new();
    public SeedUser Doctor { get; set; } = new();
    public SeedUser Owner { get; set; } = new();
}

public sealed class SeedUser
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}
