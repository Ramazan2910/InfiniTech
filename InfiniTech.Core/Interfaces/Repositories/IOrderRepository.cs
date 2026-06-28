using InfiniTech.Core.Entities;

namespace InfiniTech.Core.Interfaces.Repositories;

public interface IOrderRepository : IRepository<Order>
{
    Task<IEnumerable<Order>> GetByClientIdAsync(Guid clientId);
    Task<Order?> GetWithItemsAsync(Guid orderId);
}
