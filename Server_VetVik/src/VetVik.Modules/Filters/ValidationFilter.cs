using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using VetVik.BuildingBlocks.Application.Exceptions;

namespace VetVik.Modules.Filters;

/// <summary>
/// Auto-validates every action argument that has a registered FluentValidation validator.
/// On failure, throws <see cref="ValidationAppException"/>, which is mapped to 400 by the
/// global exception middleware.
/// </summary>
public sealed class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var sp = context.HttpContext.RequestServices;
        var allErrors = new Dictionary<string, List<string>>();

        foreach (var (name, argument) in context.ActionArguments)
        {
            if (argument is null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            var validator = sp.GetService(validatorType) as IValidator;
            if (validator is null) continue;

            var ctx = new ValidationContext<object>(argument);
            var result = await validator.ValidateAsync(ctx, context.HttpContext.RequestAborted);
            if (result.IsValid) continue;

            foreach (var failure in result.Errors)
            {
                var key = string.IsNullOrEmpty(failure.PropertyName) ? name : failure.PropertyName;
                if (!allErrors.TryGetValue(key, out var list))
                {
                    list = new List<string>();
                    allErrors[key] = list;
                }
                list.Add(failure.ErrorMessage);
            }
        }

        if (allErrors.Count > 0)
            throw new ValidationAppException(
                allErrors.ToDictionary(kv => kv.Key, kv => kv.Value.ToArray()));

        await next();
    }
}
