using InfiniTech.API.Extensions;
using InfiniTech.Application.DTOs.Auth;
using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Application.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace InfiniTech.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly JwtSettings _jwtSettings;

    public AuthController(IAuthService auth, IOptions<JwtSettings> jwtSettings)
    {
        _auth = auth;
        _jwtSettings = jwtSettings.Value;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        var result = await _auth.RegisterAsync(dto);
        SetRefreshTokenCookie(result.RefreshToken);
        return Ok(new { result.AccessToken, result.ExpiresAt, result.User });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        SetRefreshTokenCookie(result.RefreshToken);
        return Ok(new { result.AccessToken, result.ExpiresAt, result.User });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var token = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(token))
            return Unauthorized(new { error = "Refresh token cookie not found.", statusCode = 401 });

        var result = await _auth.RefreshTokenAsync(token);
        SetRefreshTokenCookie(result.RefreshToken);
        return Ok(new { result.AccessToken, result.ExpiresAt, result.User });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(token))
            await _auth.LogoutAsync(token);

        Response.Cookies.Delete("refreshToken");
        return Ok(new { message = "Logged out successfully." });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.GetUserId();
        var user = await _auth.GetCurrentUserAsync(userId);
        return Ok(user);
    }

    private void SetRefreshTokenCookie(string token)
    {
        Response.Cookies.Append("refreshToken", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays)
        });
    }
}
