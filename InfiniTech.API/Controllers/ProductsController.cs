using InfiniTech.Application.DTOs.Products;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfiniTech.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _products;

    public ProductsController(IProductService products) => _products = products;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductQueryParams query)
        => Ok(await _products.GetProductsAsync(query));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var product = await _products.GetProductByIdAsync(id);
        return product is null ? NotFound(new { error = "Product not found.", statusCode = 404 }) : Ok(product);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromForm] CreateProductDto dto)
    {
        var product = await _products.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromForm] UpdateProductDto dto)
        => Ok(await _products.UpdateProductAsync(id, dto));

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _products.DeleteProductAsync(id);
        return NoContent();
    }
}

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly IProductService _products;

    public CategoriesController(IProductService products) => _products = products;

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _products.GetCategoriesAsync());
}
