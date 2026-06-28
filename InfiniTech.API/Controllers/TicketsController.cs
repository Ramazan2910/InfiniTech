using InfiniTech.API.Extensions;
using InfiniTech.Application.DTOs.Query;
using InfiniTech.Application.DTOs.Tickets;
using InfiniTech.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfiniTech.API.Controllers;

[ApiController]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _tickets;

    public TicketsController(ITicketService tickets) => _tickets = tickets;

    // ── Client endpoints ──────────────────────────────────────────────────────

    [HttpPost("api/tickets")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> Create([FromForm] CreateRepairTicketDto dto)
    {
        var ticket = await _tickets.CreateTicketAsync(User.GetUserId(), dto);
        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
    }

    [HttpGet("api/tickets")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> GetMyTickets([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        => Ok(await _tickets.GetClientTicketsAsync(User.GetUserId(), page, pageSize));

    [HttpGet("api/tickets/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var role = User.GetRole();
        var ticket = await _tickets.GetTicketByIdAsync(id, User.GetUserId(), role);
        return ticket is null ? NotFound(new { error = "Ticket not found.", statusCode = 404 }) : Ok(ticket);
    }

    [HttpPost("api/tickets/{id:guid}/photos")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> AddPhotos(Guid id, [FromForm] List<IFormFile> photos)
    {
        var ticket = await _tickets.AddPhotosAsync(id, User.GetUserId(), photos);
        return Ok(ticket);
    }

    // ── Master endpoints ──────────────────────────────────────────────────────

    [HttpGet("api/master/tickets")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> GetMasterTickets([FromQuery] MasterTicketQueryParams query)
        => Ok(await _tickets.GetMasterTicketsAsync(User.GetUserId(), query));

    [HttpPost("api/master/tickets/{id:guid}/assign")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Assign(Guid id)
        => Ok(await _tickets.AssignTicketAsync(id, User.GetUserId()));

    [HttpPut("api/master/tickets/{id:guid}/status")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] MasterUpdateTicketDto dto)
        => Ok(await _tickets.UpdateTicketStatusAsync(id, User.GetUserId(), dto));

    [HttpPost("api/master/tickets/{id:guid}/comments")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddCommentDto dto)
        => Ok(await _tickets.AddCommentAsync(id, User.GetUserId(), dto));

    // ── Admin endpoints ───────────────────────────────────────────────────────

    [HttpGet("api/admin/tickets")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll([FromQuery] AdminTicketQueryParams query)
        => Ok(await _tickets.GetAllTicketsAsync(query));

    [HttpPut("api/admin/tickets/{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> AdminUpdate(Guid id, [FromBody] AdminUpdateTicketDto dto)
        => Ok(await _tickets.AdminUpdateTicketAsync(id, dto));
}
