using AutoMapper;
using InfiniTech.Application.DTOs.Products;
using InfiniTech.Core.Entities;

namespace InfiniTech.Application.Mappings;

public class ProductProfile : Profile
{
    public ProductProfile()
    {
        CreateMap<Category, CategoryDto>();

        CreateMap<Product, ProductDto>()
            .ForMember(d => d.Condition, o => o.MapFrom(s => s.Condition.ToString()))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty))
            .ForMember(d => d.CategoryEmoji, o => o.MapFrom(s => s.Category != null ? s.Category.IconEmoji : string.Empty));

        CreateMap<CreateProductDto, Product>()
            .ForMember(d => d.Id, o => o.MapFrom(_ => Guid.NewGuid()))
            .ForMember(d => d.CreatedAt, o => o.MapFrom(_ => DateTime.UtcNow))
            .ForMember(d => d.UpdatedAt, o => o.MapFrom(_ => DateTime.UtcNow))
            .ForMember(d => d.ImagePath, o => o.Ignore())
            .ForSourceMember(s => s.Image, o => o.DoNotValidate());

        CreateMap<UpdateProductDto, Product>()
            .ForMember(d => d.UpdatedAt, o => o.MapFrom(_ => DateTime.UtcNow))
            .ForMember(d => d.ImagePath, o => o.Ignore())
            .ForSourceMember(s => s.Image, o => o.DoNotValidate());
    }
}
