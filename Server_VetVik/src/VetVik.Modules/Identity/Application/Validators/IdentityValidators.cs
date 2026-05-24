using FluentValidation;
using VetVik.Modules.Identity.Application.DTOs;

namespace VetVik.Modules.Identity.Application.Validators;

internal static class IdentityValidationLimits
{
    /// <summary>Base64 data URLs for images up to 5 MB (matches the client gallery limit).</summary>
    public const int PhotoUrlMaxLength = 7_200_000;
}

public sealed class RegisterOwnerRequestValidator : AbstractValidator<RegisterOwnerRequest>
{
    public RegisterOwnerRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches(@"\d").WithMessage("Password must contain a digit.");
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Address).MaximumLength(300);
    }
}

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class UpdateCurrentUserProfileRequestValidator : AbstractValidator<UpdateCurrentUserProfileRequest>
{
    public UpdateCurrentUserProfileRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PhotoUrl).MaximumLength(IdentityValidationLimits.PhotoUrlMaxLength);
    }
}

public sealed class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches(@"\d").WithMessage("Password must contain a digit.");
    }
}
