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
using InfiniTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace InfiniTech.Application.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IRefreshTokenRepository _refreshTokens;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _email;
    private readonly IMapper _mapper;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;
    private readonly AppDbContext _db;

    public AuthService(
        IUserRepository users,
        IRefreshTokenRepository refreshTokens,
        ITokenService tokenService,
        IEmailService email,
        IMapper mapper,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthService> logger,
        AppDbContext db)
    {
        _users = users;
        _refreshTokens = refreshTokens;
        _tokenService = tokenService;
        _email = email;
        _mapper = mapper;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
        _db = db;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        var emailNorm = dto.Email.Trim().ToLowerInvariant();

        if (!IsValidEmail(emailNorm))
            throw new BadRequestException("Введите корректный email адрес");

        if (await _users.ExistsAsync(emailNorm))
            throw new ConflictException($"Email '{emailNorm}' уже зарегистрирован.");

        if (dto.Password.Length < 8
            || !dto.Password.Any(char.IsUpper)
            || !dto.Password.Any(char.IsDigit))
            throw new BadRequestException(
                "Пароль должен быть не менее 8 символов, содержать заглавную букву и цифру.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = emailNorm,
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

    public async Task ForgotPasswordAsync(string email, string frontendBaseUrl)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var user = await _users.FindByEmailAsync(normalized);

        // Always return 200 — don't reveal whether email exists
        if (user is null || !user.IsActive)
        {
            _logger.LogInformation("Forgot password requested for unknown email: {Email}", normalized);
            return;
        }

        // Invalidate old tokens
        var oldTokens = await _db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();
        foreach (var t in oldTokens) t.IsUsed = true;

        var token = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };
        _db.PasswordResetTokens.Add(token);
        await _db.SaveChangesAsync();

        var resetLink = $"{frontendBaseUrl}/auth/reset-password?token={token.Token}";
        await _email.SendPasswordResetEmailAsync(user.Email, resetLink);
        _logger.LogInformation("Password reset link sent for user {Id}", user.Id);
    }

    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        var record = await _db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == token)
            ?? throw new BadRequestException("Неверный или недействительный токен сброса пароля.");

        if (record.IsUsed || record.ExpiresAt < DateTime.UtcNow)
            throw new BadRequestException("Ссылка для сброса пароля устарела. Запросите новую.");

        if (newPassword.Length < 8 || !newPassword.Any(char.IsUpper) || !newPassword.Any(char.IsDigit))
            throw new BadRequestException("Пароль должен быть не менее 8 символов, содержать заглавную букву и цифру.");

        record.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        record.IsUsed = true;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Password reset successfully for user {Id}", record.UserId);
    }

    public async Task ChangeOwnPasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw new NotFoundException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            throw new UnauthorizedException("Неверный текущий пароль.");

        if (newPassword.Length < 8 || !newPassword.Any(char.IsUpper) || !newPassword.Any(char.IsDigit))
            throw new BadRequestException("Пароль должен быть не менее 8 символов, содержать заглавную букву и цифру.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
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

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch { return false; }
    }
}
