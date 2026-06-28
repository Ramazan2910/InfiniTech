using InfiniTech.Core.Entities;

namespace InfiniTech.Core.Interfaces.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> FindByEmailAsync(string email);
    Task<bool> ExistsAsync(string email);
}
