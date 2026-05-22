using FluentValidation;
using VetVik.Modules.Services.Application.DTOs;

namespace VetVik.Modules.Services.Application.Validators;

public sealed class UpsertServiceCategoryRequestValidator : AbstractValidator<UpsertServiceCategoryRequest>
{
    public UpsertServiceCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}

public sealed class UpsertServiceRequestValidator : AbstractValidator<UpsertServiceRequest>
{
    public UpsertServiceRequestValidator()
    {
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.DurationMinutes).InclusiveBetween(5, 480);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
    }
}
