using AutoMapper;
using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Orders;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Core.Entities;
using InfiniTech.Core.Enums;
using InfiniTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InfiniTech.Application.Services.Implementations;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly ILogger<OrderService> _logger;

    public OrderService(AppDbContext db, IMapper mapper, ILogger<OrderService> logger)
    {
        _db = db;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<OrderDto> CreateFromCartAsync(Guid userId, string? deliveryAddress, string? notes)
    {
        var cartItems = await _db.CartItems
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == userId)
            .ToListAsync();

        if (!cartItems.Any())
            throw new BadRequestException("Cart is empty.");

        // Validate stock and lock prices
        var orderItems = new List<OrderItem>();
        decimal total = 0;

        foreach (var ci in cartItems)
        {
            var product = await _db.Products.FindAsync(ci.ProductId)
                ?? throw new NotFoundException($"Product {ci.ProductId} no longer exists.");

            if (!product.IsActive)
                throw new BadRequestException($"Product '{product.Name}' is no longer available.");

            if (ci.Quantity > product.StockQuantity)
                throw new BadRequestException(
                    $"Insufficient stock for '{product.Name}'. Requested: {ci.Quantity}, Available: {product.StockQuantity}.");

            orderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Quantity = ci.Quantity,
                UnitPrice = product.Price
            });

            product.StockQuantity -= ci.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
            _db.Products.Update(product);

            total += product.Price * ci.Quantity;
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            ClientId = userId,
            Status = OrderStatus.Pending,
            TotalAmount = total,
            DeliveryAddress = deliveryAddress,
            Notes = notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            OrderItems = orderItems
        };

        _db.Orders.Add(order);
        _db.CartItems.RemoveRange(cartItems);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Order {OrderId} created for user {UserId}. Total: {Total:C}", order.Id, userId, total);

        return await LoadOrderDtoAsync(order.Id);
    }

    public async Task<PagedResult<OrderDto>> GetClientOrdersAsync(Guid clientId, int page, int pageSize)
    {
        var query = _db.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .Include(o => o.Client)
            .Where(o => o.ClientId == clientId)
            .OrderByDescending(o => o.CreatedAt);

        return await PaginateAsync(query, page, pageSize);
    }

    public async Task<OrderDto?> GetOrderByIdAsync(Guid orderId, Guid requesterId, bool isAdmin)
    {
        var order = await _db.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .Include(o => o.Client)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order is null) return null;
        if (!isAdmin && order.ClientId != requesterId)
            throw new ForbiddenException("You can only view your own orders.");

        return _mapper.Map<OrderDto>(order);
    }

    public async Task<PagedResult<OrderDto>> GetAllOrdersAsync(AdminOrderQueryParams q)
    {
        var query = _db.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .Include(o => o.Client)
            .AsQueryable();

        if (q.Status.HasValue) query = query.Where(o => o.Status == q.Status.Value);
        if (q.DateFrom.HasValue) query = query.Where(o => o.CreatedAt >= q.DateFrom.Value);
        if (q.DateTo.HasValue) query = query.Where(o => o.CreatedAt <= q.DateTo.Value);

        query = query.OrderByDescending(o => o.CreatedAt);
        return await PaginateAsync(query, q.Page, q.PageSize);
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders.FindAsync(orderId)
            ?? throw new NotFoundException($"Order {orderId} not found.");

        ValidateOrderStatusTransition(order.Status, dto.Status);

        var prev = order.Status;
        order.Status = dto.Status;
        order.UpdatedAt = DateTime.UtcNow;
        _db.Orders.Update(order);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Order {OrderId} status changed: {From} → {To}", orderId, prev, dto.Status);
        return await LoadOrderDtoAsync(orderId);
    }

    private static void ValidateOrderStatusTransition(OrderStatus current, OrderStatus next)
    {
        // Cancelled is always allowed
        if (next == OrderStatus.Cancelled) return;

        // Forward-only progression
        if ((int)next <= (int)current)
            throw new BadRequestException(
                $"Cannot change order status from {current} to {next}. Status can only move forward.");

        // Delivered is terminal
        if (current == OrderStatus.Delivered)
            throw new BadRequestException("A delivered order cannot change status.");
    }

    private async Task<OrderDto> LoadOrderDtoAsync(Guid orderId)
    {
        var order = await _db.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .Include(o => o.Client)
            .FirstAsync(o => o.Id == orderId);
        return _mapper.Map<OrderDto>(order);
    }

    private async Task<PagedResult<OrderDto>> PaginateAsync(IQueryable<Order> query, int page, int pageSize)
    {
        var total = await query.CountAsync();
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<OrderDto>
        {
            Items = _mapper.Map<List<OrderDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
