using InfiniTech.API.Extensions;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.DTOs.Users;
using InfiniTech.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfiniTech.API.Controllers;

[ApiController]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;

    public UsersController(IUserService users) => _users = users;

    // ── Own profile ───────────────────────────────────────────────────────────

    [HttpGet("api/profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await _users.GetProfileAsync(User.GetUserId());
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPut("api/profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserDto dto)
        => Ok(await _users.UpdateProfileAsync(User.GetUserId(), dto));

    // ── Admin user management ─────────────────────────────────────────────────

    [HttpGet("api/admin/users")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll([FromQuery] UserQueryParams query)
        => Ok(await _users.GetAllUsersAsync(query));

    [HttpGet("api/admin/users/{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var user = await _users.GetUserDetailAsync(id);
        return user is null ? NotFound(new { error = "User not found.", statusCode = 404 }) : Ok(user);
    }

    [HttpPut("api/admin/users/{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] ChangeUserStatusDto dto)
    {
        await _users.UpdateUserStatusAsync(id, dto.IsActive);
        return Ok(new { message = $"User status updated to IsActive={dto.IsActive}." });
    }

    [HttpPut("api/admin/users/{id:guid}/role")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] ChangeUserRoleDto dto)
    {
        await _users.UpdateUserRoleAsync(User.GetUserId(), id, dto.Role);
        return Ok(new { message = $"User role updated to {dto.Role}." });
    }
}
