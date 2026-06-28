using AutoMapper;
using InfiniTech.Application.Common;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.DTOs.Tickets;
using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Core.Entities;
using InfiniTech.Core.Enums;
using InfiniTech.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InfiniTech.Application.Services.Implementations;

public class TicketService : ITicketService
{
    private readonly AppDbContext _db;
    private readonly IFileService _files;
    private readonly IMapper _mapper;
    private readonly ILogger<TicketService> _logger;

    public TicketService(AppDbContext db, IFileService files, IMapper mapper, ILogger<TicketService> logger)
    {
        _db = db;
        _files = files;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<RepairTicketDto> CreateTicketAsync(Guid clientId, CreateRepairTicketDto dto)
    {
        var ticket = new RepairTicket
        {
            Id = Guid.NewGuid(),
            ClientId = clientId,
            DeviceType = dto.DeviceType,
            DeviceBrand = dto.DeviceBrand,
            DeviceModel = dto.DeviceModel,
            ProblemDescription = dto.ProblemDescription,
            SerialNumber = dto.SerialNumber,
            Status = TicketStatus.WaitingForMaster,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.RepairTickets.Add(ticket);

        if (dto.Photos is { Count: > 0 })
        {
            if (dto.Photos.Count > 5)
                throw new BadRequestException("Maximum 5 photos allowed per ticket.");

            foreach (var photo in dto.Photos)
            {
                if (!_files.IsValidFile(photo))
                    throw new BadRequestException($"File '{photo.FileName}' is not a valid image.");

                var path = await _files.SaveTicketPhotoAsync(photo, ticket.Id);
                _db.TicketPhotos.Add(new TicketPhoto
                {
                    Id = Guid.NewGuid(),
                    TicketId = ticket.Id,
                    FilePath = path,
                    OriginalFileName = photo.FileName,
                    UploadedAt = DateTime.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Ticket {TicketId} created by client {ClientId}", ticket.Id, clientId);
        return await LoadTicketDtoAsync(ticket.Id, clientId, "Client");
    }

    public async Task<PagedResult<RepairTicketDto>> GetClientTicketsAsync(Guid clientId, int page, int pageSize)
    {
        var query = _db.RepairTickets
            .Include(t => t.Master)
            .Include(t => t.Photos)
            .Where(t => t.ClientId == clientId)
            .OrderByDescending(t => t.CreatedAt);

        return await PaginateAsync(query, page, pageSize, clientId, "Client");
    }

    public async Task<RepairTicketDto?> GetTicketByIdAsync(Guid ticketId, Guid requesterId, string role)
    {
        var ticket = await LoadFullTicketAsync(ticketId);
        if (ticket is null) return null;

        if (role == "Client" && ticket.ClientId != requesterId)
            throw new ForbiddenException("You can only view your own tickets.");

        if (role == "Master" && ticket.MasterId != requesterId)
            throw new ForbiddenException("You can only view tickets assigned to you.");

        var dto = _mapper.Map<RepairTicketDto>(ticket);

        // Filter internal comments for clients
        if (role == "Client")
            dto.Comments = dto.Comments.Where(c => !c.IsInternal).ToList();

        return dto;
    }

    public async Task<RepairTicketDto> AddPhotosAsync(Guid ticketId, Guid clientId, List<IFormFile> photos)
    {
        var ticket = await _db.RepairTickets
            .Include(t => t.Photos)
            .FirstOrDefaultAsync(t => t.Id == ticketId)
            ?? throw new NotFoundException($"Ticket {ticketId} not found.");

        if (ticket.ClientId != clientId)
            throw new ForbiddenException("This is not your ticket.");

        if (ticket.Status != TicketStatus.WaitingForMaster)
            throw new BadRequestException("Photos can only be added while the ticket is waiting for a master.");

        var existing = ticket.Photos.Count;
        if (existing + photos.Count > 5)
            throw new BadRequestException($"Maximum 5 photos per ticket. Already have {existing}.");

        foreach (var photo in photos)
        {
            if (!_files.IsValidFile(photo))
                throw new BadRequestException($"File '{photo.FileName}' is not a valid image.");

            var path = await _files.SaveTicketPhotoAsync(photo, ticketId);
            _db.TicketPhotos.Add(new TicketPhoto
            {
                Id = Guid.NewGuid(),
                TicketId = ticketId,
                FilePath = path,
                OriginalFileName = photo.FileName,
                UploadedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        return await LoadTicketDtoAsync(ticketId, clientId, "Client");
    }

    public async Task<PagedResult<RepairTicketDto>> GetMasterTicketsAsync(Guid masterId, MasterTicketQueryParams q)
    {
        var query = _db.RepairTickets
            .Include(t => t.Client)
            .Include(t => t.Master)
            .Include(t => t.Photos)
            .Where(t => (t.Status == TicketStatus.WaitingForMaster && t.MasterId == null)
                      || t.MasterId == masterId)
            .AsQueryable();

        if (q.Status.HasValue) query = query.Where(t => t.Status == q.Status.Value);
        if (q.DeviceType.HasValue) query = query.Where(t => t.DeviceType == q.DeviceType.Value);

        query = query.OrderByDescending(t => t.CreatedAt);
        return await PaginateAsync(query, q.Page, q.PageSize, masterId, "Master");
    }

    public async Task<RepairTicketDto> AssignTicketAsync(Guid ticketId, Guid masterId)
    {
        var ticket = await _db.RepairTickets.FindAsync(ticketId)
            ?? throw new NotFoundException($"Ticket {ticketId} not found.");

        if (ticket.Status != TicketStatus.WaitingForMaster)
            throw new BadRequestException("Only tickets with status 'WaitingForMaster' can be assigned.");

        if (ticket.MasterId.HasValue)
            throw new ConflictException("This ticket is already assigned to a master.");

        ticket.MasterId = masterId;
        ticket.Status = TicketStatus.Diagnosis;
        ticket.UpdatedAt = DateTime.UtcNow;
        _db.RepairTickets.Update(ticket);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Ticket {TicketId} assigned to master {MasterId}", ticketId, masterId);
        return await LoadTicketDtoAsync(ticketId, masterId, "Master");
    }

    public async Task<RepairTicketDto> UpdateTicketStatusAsync(Guid ticketId, Guid masterId, MasterUpdateTicketDto dto)
    {
        var ticket = await _db.RepairTickets.FindAsync(ticketId)
            ?? throw new NotFoundException($"Ticket {ticketId} not found.");

        if (ticket.MasterId != masterId)
            throw new ForbiddenException("You can only update tickets assigned to you.");

        ValidateTicketTransition(ticket, dto.Status, dto.DiagnosisResult, dto.RepairCost);

        var prev = ticket.Status;
        ticket.Status = dto.Status;
        if (dto.DiagnosisResult is not null) ticket.DiagnosisResult = dto.DiagnosisResult;
        if (dto.RepairCost.HasValue) ticket.RepairCost = dto.RepairCost;
        if (dto.Status == TicketStatus.Completed) ticket.CompletedAt = DateTime.UtcNow;
        ticket.UpdatedAt = DateTime.UtcNow;
        _db.RepairTickets.Update(ticket);

        if (!string.IsNullOrWhiteSpace(dto.Comment))
        {
            _db.TicketComments.Add(new TicketComment
            {
                Id = Guid.NewGuid(),
                TicketId = ticketId,
                AuthorId = masterId,
                Content = dto.Comment,
                IsInternal = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Ticket {TicketId} status: {From} → {To} by master {MasterId}", ticketId, prev, dto.Status, masterId);
        return await LoadTicketDtoAsync(ticketId, masterId, "Master");
    }

    public async Task<TicketCommentDto> AddCommentAsync(Guid ticketId, Guid authorId, AddCommentDto dto)
    {
        var ticket = await _db.RepairTickets.FindAsync(ticketId)
            ?? throw new NotFoundException($"Ticket {ticketId} not found.");

        var comment = new TicketComment
        {
            Id = Guid.NewGuid(),
            TicketId = ticketId,
            AuthorId = authorId,
            Content = dto.Content,
            IsInternal = dto.IsInternal,
            CreatedAt = DateTime.UtcNow
        };

        _db.TicketComments.Add(comment);
        await _db.SaveChangesAsync();

        var author = await _db.Users.FindAsync(authorId);
        return new TicketCommentDto
        {
            Id = comment.Id,
            AuthorId = authorId,
            AuthorName = author is not null ? $"{author.FirstName} {author.LastName}" : "Unknown",
            Content = comment.Content,
            IsInternal = comment.IsInternal,
            CreatedAt = comment.CreatedAt
        };
    }

    public async Task<PagedResult<RepairTicketDto>> GetAllTicketsAsync(AdminTicketQueryParams q)
    {
        var query = _db.RepairTickets
            .Include(t => t.Client)
            .Include(t => t.Master)
            .Include(t => t.Photos)
            .AsQueryable();

        if (q.Status.HasValue) query = query.Where(t => t.Status == q.Status.Value);
        if (q.MasterId.HasValue) query = query.Where(t => t.MasterId == q.MasterId.Value);
        if (q.ClientId.HasValue) query = query.Where(t => t.ClientId == q.ClientId.Value);
        if (q.DeviceType.HasValue) query = query.Where(t => t.DeviceType == q.DeviceType.Value);
        if (q.DateFrom.HasValue) query = query.Where(t => t.CreatedAt >= q.DateFrom.Value);
        if (q.DateTo.HasValue) query = query.Where(t => t.CreatedAt <= q.DateTo.Value);

        query = query.OrderByDescending(t => t.CreatedAt);
        return await PaginateAsync(query, q.Page, q.PageSize, Guid.Empty, "Admin");
    }

    public async Task<RepairTicketDto> AdminUpdateTicketAsync(Guid ticketId, AdminUpdateTicketDto dto)
    {
        var ticket = await _db.RepairTickets.FindAsync(ticketId)
            ?? throw new NotFoundException($"Ticket {ticketId} not found.");

        if (dto.MasterId.HasValue) ticket.MasterId = dto.MasterId;
        if (dto.Status.HasValue) ticket.Status = dto.Status.Value;
        if (dto.DiagnosisResult is not null) ticket.DiagnosisResult = dto.DiagnosisResult;
        if (dto.RepairCost.HasValue) ticket.RepairCost = dto.RepairCost;
        if (dto.Status == TicketStatus.Completed) ticket.CompletedAt = DateTime.UtcNow;
        ticket.UpdatedAt = DateTime.UtcNow;
        _db.RepairTickets.Update(ticket);

        if (!string.IsNullOrWhiteSpace(dto.Comment))
        {
            var adminId = ticket.MasterId ?? ticket.ClientId;
            _db.TicketComments.Add(new TicketComment
            {
                Id = Guid.NewGuid(),
                TicketId = ticketId,
                AuthorId = adminId,
                Content = dto.Comment,
                IsInternal = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        return await LoadTicketDtoAsync(ticketId, Guid.Empty, "Admin");
    }

    private static void ValidateTicketTransition(RepairTicket t, TicketStatus next, string? diagnosis, decimal? cost)
    {
        if (next == TicketStatus.Cancelled) return;

        var valid = (t.Status, next) switch
        {
            (TicketStatus.Diagnosis, TicketStatus.PriceApproval) => true,
            (TicketStatus.PriceApproval, TicketStatus.InRepair) => true,
            (TicketStatus.InRepair, TicketStatus.WaitingForParts) => true,
            (TicketStatus.WaitingForParts, TicketStatus.InRepair) => true,
            (TicketStatus.InRepair, TicketStatus.ReadyForPickup) => true,
            (TicketStatus.ReadyForPickup, TicketStatus.Completed) => true,
            _ => false
        };

        if (!valid)
            throw new BadRequestException($"Invalid status transition: {t.Status} → {next}.");

        if (next == TicketStatus.PriceApproval && string.IsNullOrWhiteSpace(diagnosis))
            throw new BadRequestException("Diagnosis result is required when moving to PriceApproval.");

        if (next == TicketStatus.InRepair && t.Status == TicketStatus.PriceApproval && !cost.HasValue)
            throw new BadRequestException("Repair cost is required when moving to InRepair.");
    }

    private async Task<RepairTicket?> LoadFullTicketAsync(Guid ticketId) =>
        await _db.RepairTickets
            .Include(t => t.Client)
            .Include(t => t.Master)
            .Include(t => t.Photos)
            .Include(t => t.Comments).ThenInclude(c => c.Author)
            .FirstOrDefaultAsync(t => t.Id == ticketId);

    private async Task<RepairTicketDto> LoadTicketDtoAsync(Guid ticketId, Guid requesterId, string role)
    {
        var ticket = await LoadFullTicketAsync(ticketId)
            ?? throw new NotFoundException($"Ticket {ticketId} not found.");
        var dto = _mapper.Map<RepairTicketDto>(ticket);
        if (role == "Client")
            dto.Comments = dto.Comments.Where(c => !c.IsInternal).ToList();
        return dto;
    }

    private async Task<PagedResult<RepairTicketDto>> PaginateAsync(
        IQueryable<RepairTicket> query, int page, int pageSize, Guid requesterId, string role)
    {
        var total = await query.CountAsync();
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<RepairTicketDto>>(items);
        if (role == "Client")
            foreach (var d in dtos) d.Comments = d.Comments.Where(c => !c.IsInternal).ToList();
        return new PagedResult<RepairTicketDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }
}
