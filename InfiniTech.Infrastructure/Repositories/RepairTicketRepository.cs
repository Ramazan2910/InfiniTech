using InfiniTech.Core.Entities;
using InfiniTech.Core.Enums;
using InfiniTech.Core.Interfaces.Repositories;
using InfiniTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfiniTech.Infrastructure.Repositories;

public class RepairTicketRepository : GenericRepository<RepairTicket>, IRepairTicketRepository
{
    public RepairTicketRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<RepairTicket>> GetByClientIdAsync(Guid clientId) =>
        await _dbSet.Include(t => t.Master)
            .Where(t => t.ClientId == clientId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<RepairTicket>> GetByMasterIdAsync(Guid masterId) =>
        await _dbSet.Include(t => t.Client)
            .Where(t => t.MasterId == masterId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<RepairTicket>> GetByStatusAsync(TicketStatus status) =>
        await _dbSet.Include(t => t.Client)
            .Include(t => t.Master)
            .Where(t => t.Status == status)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

    public async Task<RepairTicket?> GetWithDetailsAsync(Guid ticketId) =>
        await _dbSet
            .Include(t => t.Client)
            .Include(t => t.Master)
            .Include(t => t.Photos)
            .Include(t => t.Comments)
                .ThenInclude(c => c.Author)
            .FirstOrDefaultAsync(t => t.Id == ticketId);
}
