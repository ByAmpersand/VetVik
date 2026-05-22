using VetVik.Modules.Clinic.Application.DTOs;

namespace VetVik.Modules.Clinic.Application.Services;

public interface IClinicService
{
    Task<ClinicSettingsResponse> GetSettingsAsync(CancellationToken ct);
    Task<ClinicSettingsResponse> UpdateSettingsAsync(UpdateClinicSettingsRequest request, CancellationToken ct);

    Task<IReadOnlyList<ClinicWorkingHourResponse>> GetWorkingHoursAsync(CancellationToken ct);
    Task<IReadOnlyList<ClinicWorkingHourResponse>> ReplaceWorkingHoursAsync(
        IReadOnlyList<UpsertClinicWorkingHourRequest> requests, CancellationToken ct);

    Task<IReadOnlyList<RoomResponse>> GetRoomsAsync(bool includeInactive, CancellationToken ct);
    Task<RoomResponse> GetRoomAsync(Guid id, CancellationToken ct);
    Task<RoomResponse> CreateRoomAsync(UpsertRoomRequest request, CancellationToken ct);
    Task<RoomResponse> UpdateRoomAsync(Guid id, UpsertRoomRequest request, CancellationToken ct);
    Task DeleteRoomAsync(Guid id, CancellationToken ct);
}
