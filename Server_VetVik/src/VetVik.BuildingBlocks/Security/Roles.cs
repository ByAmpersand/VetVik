namespace VetVik.BuildingBlocks.Security;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Doctor = "Doctor";
    public const string Owner = "Owner";

    public static readonly IReadOnlyList<string> All = new[] { Admin, Doctor, Owner };
}
