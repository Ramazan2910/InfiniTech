using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Products;
using InfiniTech.Application.DTOs.Query;

namespace InfiniTech.Application.Services.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(ProductQueryParams query);
    Task<ProductDto?> GetProductByIdAsync(Guid id);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductDto dto);
    Task DeleteProductAsync(Guid id);
    Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
}
