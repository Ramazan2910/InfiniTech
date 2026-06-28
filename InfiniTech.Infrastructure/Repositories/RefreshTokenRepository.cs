using InfiniTech.Core.Entities;
using InfiniTech.Core.Interfaces.Repositories;
using InfiniTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfiniTech.Infrastructure.Repositories;

public class RefreshTokenRepository : GenericRepository<RefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(AppDbContext context) : base(context) { }

    public async Task<RefreshToken?> FindByTokenAsync(string token) =>
        await _dbSet.Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == token);

    public async Task RevokeAllForUserAsync(Guid userId)
    {
        var tokens = await _dbSet.Where(r => r.UserId == userId && !r.IsRevoked).ToListAsync();
        foreach (var token in tokens)
            token.IsRevoked = true;
    }
}
