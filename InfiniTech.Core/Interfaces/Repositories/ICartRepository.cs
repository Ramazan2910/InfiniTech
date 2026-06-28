using InfiniTech.Core.Entities;

namespace InfiniTech.Core.Interfaces.Repositories;

public interface ICartRepository : IRepository<CartItem>
{
    Task<IEnumerable<CartItem>> GetByUserIdAsync(Guid userId);
    Task<CartItem?> GetItemAsync(Guid userId, Guid productId);
    Task ClearCartAsync(Guid userId);
}
