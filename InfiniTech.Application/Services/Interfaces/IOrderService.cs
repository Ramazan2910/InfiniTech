using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Orders;
using InfiniTech.Application.DTOs.Query;

namespace InfiniTech.Application.Services.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CreateFromCartAsync(Guid userId, string? deliveryAddress, string? notes);
    Task<PagedResult<OrderDto>> GetClientOrdersAsync(Guid clientId, int page, int pageSize);
    Task<OrderDto?> GetOrderByIdAsync(Guid orderId, Guid requesterId, bool isAdmin);
    Task<PagedResult<OrderDto>> GetAllOrdersAsync(AdminOrderQueryParams query);
    Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusDto dto);
}
