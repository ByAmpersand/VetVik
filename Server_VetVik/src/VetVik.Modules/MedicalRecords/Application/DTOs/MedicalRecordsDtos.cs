namespace VetVik.Modules.MedicalRecords.Application.DTOs;

public sealed record MedicalRecordResponse(
    Guid Id,
    Guid AppointmentId,
    DateTime AppointmentDate,
    Guid PetId,
    string PetName,
    Guid DoctorId,
    string DoctorFullName,
    string? Symptoms,
    string? Diagnosis,
    string? Treatment,
    string? Recommendations,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record CreateMedicalRecordRequest(
    Guid AppointmentId,
    string? Symptoms,
    string? Diagnosis,
    string? Treatment,
    string? Recommendations);

public sealed record UpdateMedicalRecordRequest(
    string? Symptoms,
    string? Diagnosis,
    string? Treatment,
    string? Recommendations);
