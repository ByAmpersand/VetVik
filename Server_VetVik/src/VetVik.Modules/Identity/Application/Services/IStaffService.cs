using VetVik.Modules.Identity.Application.DTOs;

namespace VetVik.Modules.Identity.Application.Services;

public interface IStaffService
{
    Task<IReadOnlyList<StaffMemberResponse>> GetAllAsync(CancellationToken ct);
    Task<StaffMemberResponse> CreateAdminAsync(CreateAdminRequest request, CancellationToken ct);
    Task<StaffMemberResponse> CreateDoctorAsync(CreateDoctorStaffRequest request, CancellationToken ct);
    Task DeleteAsync(string userId, string actingUserId, CancellationToken ct);
}
