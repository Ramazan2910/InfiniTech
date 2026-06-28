using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.DTOs.Users;
using InfiniTech.Core.Enums;

namespace InfiniTech.Application.Services.Interfaces;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetAllUsersAsync(UserQueryParams query);
    Task<UserDetailDto?> GetUserDetailAsync(Guid userId);
    Task UpdateUserStatusAsync(Guid userId, bool isActive);
    Task UpdateUserRoleAsync(Guid requesterId, Guid targetUserId, UserRole role);
    Task<UserDto?> GetProfileAsync(Guid userId);
    Task<UserDto> UpdateProfileAsync(Guid userId, UpdateUserDto dto);
}
