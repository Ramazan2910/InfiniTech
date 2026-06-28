using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.DTOs.Tickets;
using Microsoft.AspNetCore.Http;

namespace InfiniTech.Application.Services.Interfaces;

public interface ITicketService
{
    Task<RepairTicketDto> CreateTicketAsync(Guid clientId, CreateRepairTicketDto dto);
    Task<PagedResult<RepairTicketDto>> GetClientTicketsAsync(Guid clientId, int page, int pageSize);
    Task<RepairTicketDto?> GetTicketByIdAsync(Guid ticketId, Guid requesterId, string role);
    Task<RepairTicketDto> AddPhotosAsync(Guid ticketId, Guid clientId, List<IFormFile> photos);
    Task<PagedResult<RepairTicketDto>> GetMasterTicketsAsync(Guid masterId, MasterTicketQueryParams query);
    Task<RepairTicketDto> AssignTicketAsync(Guid ticketId, Guid masterId);
    Task<RepairTicketDto> UpdateTicketStatusAsync(Guid ticketId, Guid masterId, MasterUpdateTicketDto dto);
    Task<TicketCommentDto> AddCommentAsync(Guid ticketId, Guid authorId, AddCommentDto dto);
    Task<PagedResult<RepairTicketDto>> GetAllTicketsAsync(AdminTicketQueryParams query);
    Task<RepairTicketDto> AdminUpdateTicketAsync(Guid ticketId, AdminUpdateTicketDto dto);
}
