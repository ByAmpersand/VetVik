using FluentValidation;
using VetVik.Modules.Pets.Application.DTOs;

namespace VetVik.Modules.Pets.Application.Validators;

public sealed class UpsertAnimalSpeciesRequestValidator : AbstractValidator<UpsertAnimalSpeciesRequest>
{
    public UpsertAnimalSpeciesRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}

public sealed class UpsertBreedRequestValidator : AbstractValidator<UpsertBreedRequest>
{
    public UpsertBreedRequestValidator()
    {
        RuleFor(x => x.SpeciesId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public sealed class CreatePetMineRequestValidator : AbstractValidator<CreatePetMineRequest>
{
    public CreatePetMineRequestValidator()
    {
        RuleFor(x => x.SpeciesId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Weight).GreaterThan(0).When(x => x.Weight.HasValue);
        RuleFor(x => x.PhotoUrl).MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(1000);
        RuleFor(x => x.Sex).IsInEnum();
    }
}

public sealed class UpsertPetRequestValidator : AbstractValidator<UpsertPetRequest>
{
    public UpsertPetRequestValidator()
    {
        RuleFor(x => x.OwnerId).NotEmpty();
        RuleFor(x => x.SpeciesId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Weight).GreaterThan(0).When(x => x.Weight.HasValue);
        RuleFor(x => x.PhotoUrl).MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(1000);
        RuleFor(x => x.Sex).IsInEnum();
    }
}
