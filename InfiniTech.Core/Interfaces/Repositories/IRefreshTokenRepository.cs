using InfiniTech.Core.Entities;

namespace InfiniTech.Core.Interfaces.Repositories;

public interface IRefreshTokenRepository : IRepository<RefreshToken>
{
    Task<RefreshToken?> FindByTokenAsync(string token);
    Task RevokeAllForUserAsync(Guid userId);
}
