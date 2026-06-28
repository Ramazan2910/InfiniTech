using AutoMapper;
using BCrypt.Net;
using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Auth;
using InfiniTech.Application.DTOs.Users;
using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Application.Settings;
using InfiniTech.Core.Entities;
using InfiniTech.Core.Enums;
using InfiniTech.Core.Interfaces.Repositories;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace InfiniTech.Application.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IRefreshTokenRepository _refreshTokens;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository users,
        IRefreshTokenRepository refreshTokens,
        ITokenService tokenService,
        IMapper mapper,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthService> logger)
    {
        _users = users;
        _refreshTokens = refreshTokens;
        _tokenService = tokenService;
        _mapper = mapper;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        if (await _users.ExistsAsync(dto.Email))
            throw new ConflictException($"Email '{dto.Email}' is already registered.");

        if (dto.Password.Length < 8
            || !dto.Password.Any(char.IsUpper)
            || !dto.Password.Any(char.IsDigit))
            throw new BadRequestException(
                "Password must be at least 8 characters and contain an uppercase letter and a digit.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Phone = dto.Phone?.Trim(),
            Role = UserRole.Client,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _users.AddAsync(user);
        await _users.SaveChangesAsync();

        _logger.LogInformation("New user registered: {Email} (Id={Id})", user.Email, user.Id);

        return await BuildAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var user = await _users.FindByEmailAsync(dto.Email.Trim().ToLowerInvariant());

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for email: {Email}", dto.Email);
            throw new UnauthorizedException("Неверный email или пароль");
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Login attempt for deactivated account: {Email}", dto.Email);
            throw new ForbiddenException("Аккаунт заблокирован");
        }

        _logger.LogInformation("User logged in: {Email} (Id={Id})", user.Email, user.Id);
        return await BuildAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var existing = await _refreshTokens.FindByTokenAsync(refreshToken);

        if (existing is null || existing.IsRevoked || existing.ExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Invalid or expired refresh token used.");
            throw new BadRequestException("Refresh token is invalid or expired.");
        }

        if (!existing.User.IsActive)
            throw new BadRequestException("Account has been deactivated.");

        // Revoke old token
        existing.IsRevoked = true;
        _refreshTokens.Update(existing);

        _logger.LogInformation("Token refreshed for user Id={UserId}", existing.UserId);
        return await BuildAuthResponseAsync(existing.User);
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var existing = await _refreshTokens.FindByTokenAsync(refreshToken);
        if (existing is not null && !existing.IsRevoked)
        {
            existing.IsRevoked = true;
            _refreshTokens.Update(existing);
            await _refreshTokens.SaveChangesAsync();
            _logger.LogInformation("User Id={UserId} logged out.", existing.UserId);
        }
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw new NotFoundException("User not found.");
        return _mapper.Map<UserDto>(user);
    }

    private async Task<AuthResponseDto> BuildAuthResponseAsync(User user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var rawRefreshToken = _tokenService.GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = rawRefreshToken,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            IsRevoked = false
        };

        await _refreshTokens.AddAsync(refreshTokenEntity);
        await _refreshTokens.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            RefreshToken = rawRefreshToken,
            User = _mapper.Map<UserTokenDto>(user)
        };
    }
}
