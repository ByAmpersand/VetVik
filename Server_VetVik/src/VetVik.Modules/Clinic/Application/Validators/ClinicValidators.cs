using FluentValidation;
using VetVik.Modules.Clinic.Application.DTOs;

namespace VetVik.Modules.Clinic.Application.Validators;

public sealed class UpdateClinicSettingsRequestValidator : AbstractValidator<UpdateClinicSettingsRequest>
{
    public UpdateClinicSettingsRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(300);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}

public sealed class UpsertRoomRequestValidator : AbstractValidator<UpsertRoomRequest>
{
    public UpsertRoomRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}

public sealed class UpsertClinicWorkingHourRequestValidator : AbstractValidator<UpsertClinicWorkingHourRequest>
{
    public UpsertClinicWorkingHourRequestValidator()
    {
        RuleFor(x => x.DayOfWeek).IsInEnum();
    }
}
