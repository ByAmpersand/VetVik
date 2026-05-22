namespace VetVik.Modules.Pets.Application.DTOs;

public sealed record VaccinationResponse(
    Guid Id,
    Guid PetId,
    string PetName,
    string VaccineName,
    DateOnly AdministeredDate,
    DateOnly NextDueDate,
    string Status,
    string? AdministeredByDoctorName);

public sealed record UpsertVaccinationRequest(
    Guid PetId,
    string VaccineName,
    DateOnly AdministeredDate,
    DateOnly NextDueDate,
    Guid? AdministeredByDoctorId);
