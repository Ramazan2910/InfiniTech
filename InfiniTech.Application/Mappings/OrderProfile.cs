using AutoMapper;
using InfiniTech.Application.DTOs.Orders;
using InfiniTech.Core.Entities;

namespace InfiniTech.Application.Mappings;

public class OrderProfile : Profile
{
    public OrderProfile()
    {
        CreateMap<Order, OrderDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ClientName, o => o.MapFrom(s =>
                s.Client != null ? $"{s.Client.FirstName} {s.Client.LastName}" : string.Empty));

        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product != null ? s.Product.Name : string.Empty))
            .ForMember(d => d.ProductSKU, o => o.MapFrom(s => s.Product != null ? s.Product.SKU : string.Empty));
    }
}
