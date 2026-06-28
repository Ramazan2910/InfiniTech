using InfiniTech.API.Extensions;
using InfiniTech.Application.DTOs.Cart;
using InfiniTech.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfiniTech.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize(Policy = "ClientOnly")]
public class CartController : ControllerBase
{
    private readonly ICartService _cart;

    public CartController(ICartService cart) => _cart = cart;

    [HttpGet]
    public async Task<IActionResult> GetCart()
        => Ok(await _cart.GetCartAsync(User.GetUserId()));

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddToCartDto dto)
        => Ok(await _cart.AddItemAsync(User.GetUserId(), dto));

    [HttpPut("items/{productId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid productId, [FromBody] UpdateCartItemDto dto)
        => Ok(await _cart.UpdateItemAsync(User.GetUserId(), productId, dto.Quantity));

    [HttpDelete("items/{productId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid productId)
    {
        await _cart.RemoveItemAsync(User.GetUserId(), productId);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        await _cart.ClearCartAsync(User.GetUserId());
        return NoContent();
    }
}
