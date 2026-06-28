using InfiniTech.Application.DTOs.Orders;
using InfiniTech.Application.DTOs.Products;

namespace InfiniTech.Application.DTOs.Admin;

public class DashboardDto
{
    public decimal TotalRevenue { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public int TotalOrders { get; set; }
    public int OrdersThisMonth { get; set; }
    public int TotalRepairs { get; set; }
    public int CompletedRepairs { get; set; }
    public int ActiveTickets { get; set; }
    public int TotalUsers { get; set; }
    public List<LowStockProductDto> LowStockProducts { get; set; } = new();
    public List<OrderDto> RecentOrders { get; set; } = new();
    public Dictionary<string, int> TicketsByStatus { get; set; } = new();
    public List<CategoryStatsDto> TopCategories { get; set; } = new();
}

public class LowStockProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
}

public class CategoryStatsDto
{
    public string Name { get; set; } = string.Empty;
    public string IconEmoji { get; set; } = string.Empty;
    public int ProductCount { get; set; }
    public int OrderCount { get; set; }
}
