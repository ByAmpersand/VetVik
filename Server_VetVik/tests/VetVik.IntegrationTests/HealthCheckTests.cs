using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using VetVik.Modules.Persistence;

namespace VetVik.IntegrationTests;

/// <summary>
/// Smoke integration test. Uses a SQLite in-memory database so it doesn't depend on
/// Docker/SQL Server being up. Validates that the dependency graph composes correctly
/// and that the Swagger endpoint is reachable.
/// </summary>
public sealed class HealthCheckTests : IClassFixture<VetVikWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthCheckTests(VetVikWebApplicationFactory factory) =>
        _client = factory.CreateClient();

    [Fact]
    public async Task Swagger_endpoint_responds()
    {
        var resp = await _client.GetAsync("/swagger/v1/swagger.json");
        Assert.True(resp.IsSuccessStatusCode, $"Expected 2xx, got {(int)resp.StatusCode}");
    }
}

public sealed class VetVikWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            // Strip the SQL Server DbContext and replace with SQLite in-memory.
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<VetVikDbContext>));
            if (descriptor is not null) services.Remove(descriptor);

            var conn = new Microsoft.Data.Sqlite.SqliteConnection("DataSource=:memory:");
            conn.Open();
            services.AddSingleton(conn);
            services.AddDbContext<VetVikDbContext>(opts => opts.UseSqlite(conn));
        });
    }
}
