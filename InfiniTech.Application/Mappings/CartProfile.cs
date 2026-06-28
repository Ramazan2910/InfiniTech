using AutoMapper;
using InfiniTech.Application.DTOs.Cart;
using InfiniTech.Core.Entities;

namespace InfiniTech.Application.Mappings;

public class CartProfile : Profile
{
    public CartProfile()
    {
        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product != null ? s.Product.Name : string.Empty))
            .ForMember(d => d.ProductSKU, o => o.MapFrom(s => s.Product != null ? s.Product.SKU : string.Empty))
            .ForMember(d => d.ProductImagePath, o => o.MapFrom(s => s.Product != null ? s.Product.ImagePath : null))
            .ForMember(d => d.UnitPrice, o => o.MapFrom(s => s.Product != null ? s.Product.Price : 0))
            .ForMember(d => d.StockQuantity, o => o.MapFrom(s => s.Product != null ? s.Product.StockQuantity : 0));
    }
}
