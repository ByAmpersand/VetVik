namespace VetVik.BuildingBlocks.Security;

public static class Roles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string Doctor = "Doctor";
    public const string Owner = "Owner";

    public static readonly IReadOnlyList<string> All = new[] { SuperAdmin, Admin, Doctor, Owner };

    /// <summary>Admin-level clinic operations (Admin or SuperAdmin).</summary>
    public const string ClinicAdmin = $"{Admin},{SuperAdmin}";
}
