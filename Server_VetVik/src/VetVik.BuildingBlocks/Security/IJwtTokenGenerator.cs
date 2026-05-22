namespace VetVik.BuildingBlocks.Security;

public interface IJwtTokenGenerator
{
    JwtTokenResult Generate(string userId, string email, IReadOnlyCollection<string> roles);
}

public sealed record JwtTokenResult(string AccessToken, DateTime ExpiresAtUtc);
