using InfiniTech.Core.Entities;
using InfiniTech.Core.Enums;
using InfiniTech.Core.Interfaces.Repositories;
using InfiniTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfiniTech.Infrastructure.Repositories;

public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId) =>
        await _dbSet.Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync();

    public async Task<IEnumerable<Product>> GetByConditionAsync(ProductCondition condition) =>
        await _dbSet.Include(p => p.Category)
            .Where(p => p.Condition == condition)
            .ToListAsync();

    public async Task<IEnumerable<Product>> SearchAsync(string query) =>
        await _dbSet.Include(p => p.Category)
            .Where(p => p.Name.Contains(query) || p.Description.Contains(query) || p.SKU.Contains(query))
            .ToListAsync();

    public async Task UpdateStockAsync(Guid productId, int quantity)
    {
        var product = await _dbSet.FindAsync(productId);
        if (product is not null)
        {
            product.StockQuantity = quantity;
            product.UpdatedAt = DateTime.UtcNow;
            _dbSet.Update(product);
        }
    }

    public override async Task<IEnumerable<Product>> GetAllAsync() =>
        await _dbSet.Include(p => p.Category).ToListAsync();

    public override async Task<Product?> GetByIdAsync(Guid id) =>
        await _dbSet.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
}
