using AutoMapper;
using InfiniTech.Application.DTOs.Admin;
using InfiniTech.Application.DTOs.Orders;
using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Core.Enums;
using InfiniTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfiniTech.Application.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public AdminService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var deliveredOrders = await _db.Orders
            .Where(o => o.Status == OrderStatus.Delivered)
            .ToListAsync();

        var totalRevenue = deliveredOrders.Sum(o => o.TotalAmount);
        var revenueThisMonth = deliveredOrders
            .Where(o => o.CreatedAt >= monthStart)
            .Sum(o => o.TotalAmount);

        var totalOrders = await _db.Orders.CountAsync();
        var ordersThisMonth = await _db.Orders.CountAsync(o => o.CreatedAt >= monthStart);

        var totalRepairs = await _db.RepairTickets.CountAsync();
        var completedRepairs = await _db.RepairTickets.CountAsync(t => t.Status == TicketStatus.Completed);
        var activeTickets = await _db.RepairTickets.CountAsync(t =>
            t.Status != TicketStatus.Completed && t.Status != TicketStatus.Cancelled);

        var totalUsers = await _db.Users.IgnoreQueryFilters().CountAsync();

        var lowStock = await _db.Products.IgnoreQueryFilters()
            .Where(p => p.IsActive && p.StockQuantity < 5)
            .OrderBy(p => p.StockQuantity)
            .Select(p => new LowStockProductDto { Id = p.Id, Name = p.Name, SKU = p.SKU, StockQuantity = p.StockQuantity })
            .ToListAsync();

        var recentOrders = await _db.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .Include(o => o.Client)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .ToListAsync();

        var ticketsByStatus = await _db.RepairTickets
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var statusDict = ticketsByStatus.ToDictionary(
            x => x.Status.ToString(),
            x => x.Count);

        var categories = await _db.Categories
            .Include(c => c.Products)
            .ToListAsync();

        var orderItems = await _db.OrderItems.Include(oi => oi.Product).ToListAsync();
        var topCategories = categories.Select(c =>
        {
            var productIds = c.Products.Select(p => p.Id).ToHashSet();
            return new CategoryStatsDto
            {
                Name = c.Name,
                IconEmoji = c.IconEmoji,
                ProductCount = c.Products.Count,
                OrderCount = orderItems.Count(oi => productIds.Contains(oi.ProductId))
            };
        })
        .OrderByDescending(c => c.OrderCount)
        .ToList();

        return new DashboardDto
        {
            TotalRevenue = totalRevenue,
            RevenueThisMonth = revenueThisMonth,
            TotalOrders = totalOrders,
            OrdersThisMonth = ordersThisMonth,
            TotalRepairs = totalRepairs,
            CompletedRepairs = completedRepairs,
            ActiveTickets = activeTickets,
            TotalUsers = totalUsers,
            LowStockProducts = lowStock,
            RecentOrders = _mapper.Map<List<OrderDto>>(recentOrders),
            TicketsByStatus = statusDict,
            TopCategories = topCategories
        };
    }
}
