using InfiniTech.Core.Entities;
using InfiniTech.Core.Interfaces.Repositories;
using InfiniTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfiniTech.Infrastructure.Repositories;

public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Order>> GetByClientIdAsync(Guid clientId) =>
        await _dbSet.Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Where(o => o.ClientId == clientId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<Order?> GetWithItemsAsync(Guid orderId) =>
        await _dbSet.Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Include(o => o.Client)
            .FirstOrDefaultAsync(o => o.Id == orderId);
}
