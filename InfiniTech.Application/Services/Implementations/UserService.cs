using AutoMapper;
using BCrypt.Net;
using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.DTOs.Users;
using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Core.Entities;
using InfiniTech.Core.Enums;
using InfiniTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfiniTech.Application.Services.Implementations;

public class UserService : IUserService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly IEmailService _email;

    public UserService(AppDbContext db, IMapper mapper, IEmailService email)
    {
        _db = db;
        _mapper = mapper;
        _email = email;
    }

    public async Task<PagedResult<UserDto>> GetAllUsersAsync(UserQueryParams q)
    {
        var query = _db.Users.IgnoreQueryFilters().AsQueryable();

        if (q.Role.HasValue) query = query.Where(u => u.Role == q.Role.Value);
        if (q.IsActive.HasValue) query = query.Where(u => u.IsActive == q.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.ToLower();
            query = query.Where(u => u.Email.ToLower().Contains(s)
                                  || u.FirstName.ToLower().Contains(s)
                                  || u.LastName.ToLower().Contains(s));
        }

        var total = await query.CountAsync();
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);
        var items = await query.OrderBy(u => u.Email)
            .Skip((page - 1) * size).Take(size).ToListAsync();

        return new PagedResult<UserDto>
        {
            Items = _mapper.Map<List<UserDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = size
        };
    }

    public async Task<UserDetailDto?> GetUserDetailAsync(Guid userId)
    {
        var user = await _db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return null;

        var orderCount = await _db.Orders.CountAsync(o => o.ClientId == userId);
        var ticketCount = await _db.RepairTickets.CountAsync(t => t.ClientId == userId);

        return new UserDetailDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Phone = user.Phone,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt,
            IsActive = user.IsActive,
            OrderCount = orderCount,
            TicketCount = ticketCount
        };
    }

    public async Task UpdateUserStatusAsync(Guid userId, bool isActive)
    {
        var user = await _db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new NotFoundException($"User {userId} not found.");

        user.IsActive = isActive;
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateUserRoleAsync(Guid requesterId, Guid targetUserId, UserRole role)
    {
        if (requesterId == targetUserId)
            throw new BadRequestException("You cannot change your own role.");

        var user = await _db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == targetUserId)
            ?? throw new NotFoundException($"User {targetUserId} not found.");

        user.Role = role;
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task<UserDto?> GetProfileAsync(Guid userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        return user is null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateUserDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new NotFoundException("User not found.");

        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        user.Phone = dto.Phone?.Trim();
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> AdminCreateUserAsync(AdminCreateUserDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _db.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == email))
            throw new ConflictException($"Email '{email}' уже зарегистрирован.");

        if (dto.Password.Length < 8 || !dto.Password.Any(char.IsUpper) || !dto.Password.Any(char.IsDigit))
            throw new BadRequestException("Пароль должен быть не менее 8 символов, содержать заглавную букву и цифру.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Phone = dto.Phone?.Trim(),
            Role = dto.Role,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return _mapper.Map<UserDto>(user);
    }

    public async Task AdminDeleteUserAsync(Guid requesterId, Guid targetUserId)
    {
        if (requesterId == targetUserId)
            throw new BadRequestException("Нельзя удалить собственный аккаунт.");

        var user = await _db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == targetUserId)
            ?? throw new NotFoundException($"User {targetUserId} not found.");

        // Soft delete + anonymize
        user.IsActive = false;
        user.Email = $"deleted_{targetUserId}@deleted.com";
        user.FirstName = "Deleted";
        user.LastName = "User";
        user.Phone = null;
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task AdminChangePasswordAsync(Guid targetUserId, string newPassword)
    {
        var user = await _db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == targetUserId)
            ?? throw new NotFoundException($"User {targetUserId} not found.");

        if (newPassword.Length < 8 || !newPassword.Any(char.IsUpper) || !newPassword.Any(char.IsDigit))
            throw new BadRequestException("Пароль должен быть не менее 8 символов, содержать заглавную букву и цифру.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task<string> AdminResetPasswordAsync(Guid targetUserId)
    {
        var user = await _db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == targetUserId)
            ?? throw new NotFoundException($"User {targetUserId} not found.");

        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
        var rng = new Random();
        var tempPass = new string(Enumerable.Repeat(chars, 10).Select(s => s[rng.Next(s.Length)]).ToArray());
        // Ensure at least one uppercase, one digit, one special
        tempPass = char.ToUpper(tempPass[0]) + tempPass[1..7] + "1!" + tempPass[7..];

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPass);
        _db.Users.Update(user);
        await _db.SaveChangesAsync();

        await _email.SendTempPasswordEmailAsync(user.Email, user.FirstName, tempPass);
        return tempPass;
    }
}
