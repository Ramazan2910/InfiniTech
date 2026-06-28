using InfiniTech.Core.Enums;
using Microsoft.AspNetCore.Http;

namespace InfiniTech.Application.DTOs.Products;

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public ProductCondition Condition { get; set; }
    public int CategoryId { get; set; }
    public IFormFile? Image { get; set; }
}
