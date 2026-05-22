using FluentValidation;
using VetVik.Modules.MedicalRecords.Application.DTOs;

namespace VetVik.Modules.MedicalRecords.Application.Validators;

public sealed class CreateMedicalRecordRequestValidator : AbstractValidator<CreateMedicalRecordRequest>
{
    public CreateMedicalRecordRequestValidator()
    {
        RuleFor(x => x.AppointmentId).NotEmpty();
        RuleFor(x => x.Symptoms).MaximumLength(1000);
        RuleFor(x => x.Diagnosis).MaximumLength(1000);
        RuleFor(x => x.Treatment).MaximumLength(1000);
        RuleFor(x => x.Recommendations).MaximumLength(1000);
    }
}

public sealed class UpdateMedicalRecordRequestValidator : AbstractValidator<UpdateMedicalRecordRequest>
{
    public UpdateMedicalRecordRequestValidator()
    {
        RuleFor(x => x.Symptoms).MaximumLength(1000);
        RuleFor(x => x.Diagnosis).MaximumLength(1000);
        RuleFor(x => x.Treatment).MaximumLength(1000);
        RuleFor(x => x.Recommendations).MaximumLength(1000);
    }
}
