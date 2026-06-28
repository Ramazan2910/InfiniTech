using AutoMapper;
using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Cart;
using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Core.Entities;
using InfiniTech.Core.Interfaces.Repositories;

namespace InfiniTech.Application.Services.Implementations;

public class CartService : ICartService
{
    private readonly ICartRepository _cart;
    private readonly IProductRepository _products;
    private readonly IMapper _mapper;

    public CartService(ICartRepository cart, IProductRepository products, IMapper mapper)
    {
        _cart = cart;
        _products = products;
        _mapper = mapper;
    }

    public async Task<CartDto> GetCartAsync(Guid userId)
    {
        var items = await _cart.GetByUserIdAsync(userId);
        return new CartDto { Items = _mapper.Map<List<CartItemDto>>(items) };
    }

    public async Task<CartDto> AddItemAsync(Guid userId, AddToCartDto dto)
    {
        var product = await _products.GetByIdAsync(dto.ProductId)
            ?? throw new NotFoundException($"Product {dto.ProductId} not found.");

        if (dto.Quantity <= 0) throw new BadRequestException("Quantity must be at least 1.");
        if (dto.Quantity > product.StockQuantity)
            throw new BadRequestException($"Only {product.StockQuantity} units available in stock.");

        var existing = await _cart.GetItemAsync(userId, dto.ProductId);
        if (existing is not null)
        {
            var newQty = existing.Quantity + dto.Quantity;
            if (newQty > product.StockQuantity)
                throw new BadRequestException($"Only {product.StockQuantity} units available in stock.");
            existing.Quantity = newQty;
            _cart.Update(existing);
        }
        else
        {
            await _cart.AddAsync(new CartItem
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                AddedAt = DateTime.UtcNow
            });
        }

        await _cart.SaveChangesAsync();
        return await GetCartAsync(userId);
    }

    public async Task<CartDto> UpdateItemAsync(Guid userId, Guid productId, int quantity)
    {
        if (quantity <= 0) throw new BadRequestException("Quantity must be at least 1.");

        var item = await _cart.GetItemAsync(userId, productId)
            ?? throw new NotFoundException("Cart item not found.");

        var product = await _products.GetByIdAsync(productId)
            ?? throw new NotFoundException("Product not found.");

        if (quantity > product.StockQuantity)
            throw new BadRequestException($"Only {product.StockQuantity} units available in stock.");

        item.Quantity = quantity;
        _cart.Update(item);
        await _cart.SaveChangesAsync();
        return await GetCartAsync(userId);
    }

    public async Task RemoveItemAsync(Guid userId, Guid productId)
    {
        var item = await _cart.GetItemAsync(userId, productId)
            ?? throw new NotFoundException("Cart item not found.");
        _cart.Delete(item);
        await _cart.SaveChangesAsync();
    }

    public async Task ClearCartAsync(Guid userId)
    {
        await _cart.ClearCartAsync(userId);
        await _cart.SaveChangesAsync();
    }
}
