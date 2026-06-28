using InfiniTech.Application.DTOs.Admin;

namespace InfiniTech.Application.Services.Interfaces;

public interface IAdminService
{
    Task<DashboardDto> GetDashboardAsync();
}
