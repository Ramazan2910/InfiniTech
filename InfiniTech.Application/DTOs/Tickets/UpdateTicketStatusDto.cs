using InfiniTech.Core.Enums;

namespace InfiniTech.Application.DTOs.Tickets;

public class UpdateTicketStatusDto
{
    public TicketStatus Status { get; set; }
    public string? DiagnosisResult { get; set; }
    public decimal? RepairCost { get; set; }
}
