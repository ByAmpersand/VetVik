using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VetVik.BuildingBlocks.Application;
using VetVik.BuildingBlocks.Application.Exceptions;

namespace VetVik.BuildingBlocks.Middleware;

public sealed class GlobalExceptionMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception ex)
    {
        var (status, payload) = ex switch
        {
            ValidationAppException v => (StatusCodes.Status400BadRequest, new ApiErrorResponse
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = v.Message,
                Errors = v.Errors,
                TraceId = context.TraceIdentifier
            }),
            NotFoundException nf => (StatusCodes.Status404NotFound, new ApiErrorResponse
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Not found",
                Detail = nf.Message,
                TraceId = context.TraceIdentifier
            }),
            ForbiddenException f => (StatusCodes.Status403Forbidden, new ApiErrorResponse
            {
                Status = StatusCodes.Status403Forbidden,
                Title = "Forbidden",
                Detail = f.Message,
                TraceId = context.TraceIdentifier
            }),
            ConflictException c => (StatusCodes.Status409Conflict, new ApiErrorResponse
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Conflict",
                Detail = c.Message,
                TraceId = context.TraceIdentifier
            }),
            BusinessRuleException b => (StatusCodes.Status422UnprocessableEntity, new ApiErrorResponse
            {
                Status = StatusCodes.Status422UnprocessableEntity,
                Title = "Business rule violated",
                Detail = b.Message,
                TraceId = context.TraceIdentifier
            }),
            _ => (StatusCodes.Status500InternalServerError, new ApiErrorResponse
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = _environment.IsDevelopment()
                    ? ex.Message
                    : "An unexpected error occurred.",
                TraceId = context.TraceIdentifier
            })
        };

        if (status >= 500)
            _logger.LogError(ex, "Unhandled exception. TraceId={TraceId}", context.TraceIdentifier);
        else
            _logger.LogWarning(ex, "Handled application error. TraceId={TraceId}", context.TraceIdentifier);

        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }
}
