using FluentValidation;
using VetVik.Modules.Appointments.Application.DTOs;

namespace VetVik.Modules.Appointments.Application.Validators;

public sealed class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
{
    public CreateAppointmentRequestValidator()
    {
        RuleFor(x => x.PetId).NotEmpty();
        RuleFor(x => x.DoctorId).NotEmpty();
        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.ServiceId).NotEmpty();
        RuleFor(x => x.StartAt).NotEmpty();
        RuleFor(x => x.EndAt).GreaterThan(x => x.StartAt).When(x => x.EndAt.HasValue);
        RuleFor(x => x.Reason).MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(1000);
    }
}

public sealed class UpdateAppointmentRequestValidator : AbstractValidator<UpdateAppointmentRequest>
{
    public UpdateAppointmentRequestValidator()
    {
        RuleFor(x => x.PetId).NotEmpty();
        RuleFor(x => x.DoctorId).NotEmpty();
        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.ServiceId).NotEmpty();
        RuleFor(x => x.StartAt).NotEmpty();
        RuleFor(x => x.EndAt).GreaterThan(x => x.StartAt).When(x => x.EndAt.HasValue);
        RuleFor(x => x.Reason).MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(1000);
    }
}

public sealed class CancelAppointmentRequestValidator : AbstractValidator<CancelAppointmentRequest>
{
    public CancelAppointmentRequestValidator()
    {
        RuleFor(x => x.Reason).MaximumLength(500);
    }
}
