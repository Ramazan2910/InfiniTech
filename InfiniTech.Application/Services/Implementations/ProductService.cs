using AutoMapper;
using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Products;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Core.Entities;
using InfiniTech.Core.Enums;
using InfiniTech.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace InfiniTech.Application.Services.Implementations;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;
    private readonly IFileService _fileService;
    private readonly IMapper _mapper;

    public ProductService(AppDbContext db, IFileService fileService, IMapper mapper)
    {
        _db = db;
        _fileService = fileService;
        _mapper = mapper;
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductQueryParams q)
    {
        var query = _db.Products.Include(p => p.Category).AsQueryable();

        if (q.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == q.CategoryId.Value);

        if (!string.IsNullOrWhiteSpace(q.Condition))
        {
            if (Enum.TryParse<ProductCondition>(q.Condition, true, out var condition))
                query = query.Where(p => p.Condition == condition);
        }

        if (q.MinPrice.HasValue) query = query.Where(p => p.Price >= q.MinPrice.Value);
        if (q.MaxPrice.HasValue) query = query.Where(p => p.Price <= q.MaxPrice.Value);

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s)
                                  || p.Description.ToLower().Contains(s)
                                  || p.SKU.ToLower().Contains(s));
        }

        query = q.SortBy switch
        {
            "price_asc"    => query.OrderBy(p => p.Price),
            "price_desc"   => query.OrderByDescending(p => p.Price),
            "name_asc"     => query.OrderBy(p => p.Name),
            "name_desc"    => query.OrderByDescending(p => p.Name),
            "created_asc"  => query.OrderBy(p => p.CreatedAt),
            _              => query.OrderByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync();
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);

        var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();

        return new PagedResult<ProductDto>
        {
            Items = _mapper.Map<List<ProductDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = size
        };
    }

    public async Task<ProductDto?> GetProductByIdAsync(Guid id)
    {
        var product = await _db.Products.Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
        return product is null ? null : _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        if (await _db.Products.IgnoreQueryFilters().AnyAsync(p => p.SKU == dto.SKU))
            throw new ConflictException($"SKU '{dto.SKU}' is already in use.");

        if (dto.Price <= 0) throw new BadRequestException("Price must be greater than zero.");
        if (dto.StockQuantity < 0) throw new BadRequestException("Stock quantity cannot be negative.");

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            SKU = dto.SKU,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            Condition = dto.Condition,
            CategoryId = dto.CategoryId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true
        };

        if (dto.Image is not null)
        {
            if (!_fileService.IsValidFile(dto.Image))
                throw new BadRequestException("Invalid image file. Allowed: .jpg, .jpeg, .png, .webp (max 10MB).");
            product.ImagePath = await _fileService.SaveProductImageAsync(dto.Image);
        }

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        await _db.Entry(product).Reference(p => p.Category).LoadAsync();
        return _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductDto dto)
    {
        var product = await _db.Products.IgnoreQueryFilters()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new NotFoundException($"Product {id} not found.");

        if (dto.Price <= 0) throw new BadRequestException("Price must be greater than zero.");
        if (dto.StockQuantity < 0) throw new BadRequestException("Stock quantity cannot be negative.");

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.StockQuantity = dto.StockQuantity;
        product.Condition = dto.Condition;
        product.CategoryId = dto.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        if (dto.Image is not null)
        {
            if (!_fileService.IsValidFile(dto.Image))
                throw new BadRequestException("Invalid image file. Allowed: .jpg, .jpeg, .png, .webp (max 10MB).");

            if (product.ImagePath is not null)
                await _fileService.DeleteFileAsync(product.ImagePath);

            product.ImagePath = await _fileService.SaveProductImageAsync(dto.Image);
        }

        _db.Products.Update(product);
        await _db.SaveChangesAsync();
        await _db.Entry(product).Reference(p => p.Category).LoadAsync();
        return _mapper.Map<ProductDto>(product);
    }

    public async Task DeleteProductAsync(Guid id)
    {
        var product = await _db.Products.IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new NotFoundException($"Product {id} not found.");

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        _db.Products.Update(product);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
    {
        var cats = await _db.Categories
            .Include(c => c.Products)
            .OrderBy(c => c.Name)
            .ToListAsync();
        return _mapper.Map<IEnumerable<CategoryDto>>(cats);
    }
}
