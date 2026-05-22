namespace VetVik.BuildingBlocks.Application;

/// <summary>
/// Uniform error payload returned by the global exception middleware.
/// Follows RFC 7807-like shape without enforcing the full ProblemDetails contract.
/// </summary>
public sealed class ApiErrorResponse
{
    public int Status { get; init; }
    public string Title { get; init; } = "Error";
    public string? Detail { get; init; }
    public string? TraceId { get; init; }
    public IReadOnlyDictionary<string, string[]>? Errors { get; init; }
}
