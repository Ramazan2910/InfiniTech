using AutoMapper;
using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.DTOs.Users;
using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Core.Enums;
using InfiniTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfiniTech.Application.Services.Implementations;

public class UserService : IUserService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public UserService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
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
}
