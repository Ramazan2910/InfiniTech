using InfiniTech.API.Extensions;
using InfiniTech.Application.DTOs.Orders;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfiniTech.API.Controllers;

[ApiController]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orders;

    public OrdersController(IOrderService orders) => _orders = orders;

    // ── Client endpoints ──────────────────────────────────────────────────────

    [HttpPost("api/orders")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var order = await _orders.CreateFromCartAsync(
            User.GetUserId(), dto.DeliveryAddress, dto.Notes);
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    [HttpGet("api/orders")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> GetMyOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        => Ok(await _orders.GetClientOrdersAsync(User.GetUserId(), page, pageSize));

    [HttpGet("api/orders/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var isAdmin = User.IsAdmin();
        var order = await _orders.GetOrderByIdAsync(id, User.GetUserId(), isAdmin);
        return order is null ? NotFound(new { error = "Order not found.", statusCode = 404 }) : Ok(order);
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    [HttpGet("api/admin/orders")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllOrders([FromQuery] AdminOrderQueryParams query)
        => Ok(await _orders.GetAllOrdersAsync(query));

    [HttpPut("api/admin/orders/{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
        => Ok(await _orders.UpdateOrderStatusAsync(id, dto));
}
