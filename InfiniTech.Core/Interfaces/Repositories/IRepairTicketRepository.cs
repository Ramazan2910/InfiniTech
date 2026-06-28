using InfiniTech.Core.Entities;
using InfiniTech.Core.Enums;

namespace InfiniTech.Core.Interfaces.Repositories;

public interface IRepairTicketRepository : IRepository<RepairTicket>
{
    Task<IEnumerable<RepairTicket>> GetByClientIdAsync(Guid clientId);
    Task<IEnumerable<RepairTicket>> GetByMasterIdAsync(Guid masterId);
    Task<IEnumerable<RepairTicket>> GetByStatusAsync(TicketStatus status);
    Task<RepairTicket?> GetWithDetailsAsync(Guid ticketId);
}
