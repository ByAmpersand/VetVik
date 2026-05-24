using FluentValidation;
using VetVik.Modules.Doctors.Application.DTOs;

namespace VetVik.Modules.Doctors.Application.Validators;

internal static class DoctorValidationLimits
{
    /// <summary>Base64 data URLs for images up to 5 MB (matches the client gallery limit).</summary>
    public const int PhotoUrlMaxLength = 7_200_000;
}

public sealed class CreateDoctorRequestValidator : AbstractValidator<CreateDoctorRequest>
{
    public CreateDoctorRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.Password)
            .NotEmpty().MinimumLength(8)
            .Matches(@"[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches(@"\d").WithMessage("Password must contain a digit.");
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Bio).MaximumLength(1000);
        RuleFor(x => x.PhotoUrl).MaximumLength(DoctorValidationLimits.PhotoUrlMaxLength);
    }
}

public sealed class UpdateDoctorRequestValidator : AbstractValidator<UpdateDoctorRequest>
{
    public UpdateDoctorRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Bio).MaximumLength(1000);
        RuleFor(x => x.PhotoUrl).MaximumLength(DoctorValidationLimits.PhotoUrlMaxLength);
    }
}

public sealed class UpsertSpecializationRequestValidator : AbstractValidator<UpsertSpecializationRequest>
{
    public UpsertSpecializationRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}

public sealed class UpsertDoctorWorkingHourRequestValidator : AbstractValidator<UpsertDoctorWorkingHourRequest>
{
    public UpsertDoctorWorkingHourRequestValidator()
    {
        RuleFor(x => x.DayOfWeek).IsInEnum();
    }
}
