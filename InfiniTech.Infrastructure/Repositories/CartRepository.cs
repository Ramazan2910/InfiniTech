using InfiniTech.Core.Entities;
using InfiniTech.Core.Interfaces.Repositories;
using InfiniTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfiniTech.Infrastructure.Repositories;

public class CartRepository : GenericRepository<CartItem>, ICartRepository
{
    public CartRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<CartItem>> GetByUserIdAsync(Guid userId) =>
        await _dbSet.Include(ci => ci.Product)
            .ThenInclude(p => p.Category)
            .Where(ci => ci.UserId == userId)
            .ToListAsync();

    public async Task<CartItem?> GetItemAsync(Guid userId, Guid productId) =>
        await _dbSet.FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);

    public async Task ClearCartAsync(Guid userId)
    {
        var items = await _dbSet.Where(ci => ci.UserId == userId).ToListAsync();
        _dbSet.RemoveRange(items);
    }
}
