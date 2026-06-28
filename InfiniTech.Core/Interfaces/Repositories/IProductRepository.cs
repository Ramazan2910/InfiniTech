using InfiniTech.Core.Entities;
using InfiniTech.Core.Enums;

namespace InfiniTech.Core.Interfaces.Repositories;

public interface IProductRepository : IRepository<Product>
{
    Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId);
    Task<IEnumerable<Product>> GetByConditionAsync(ProductCondition condition);
    Task<IEnumerable<Product>> SearchAsync(string query);
    Task UpdateStockAsync(Guid productId, int quantity);
}
