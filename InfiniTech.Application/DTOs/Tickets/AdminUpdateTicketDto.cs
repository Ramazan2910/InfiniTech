using InfiniTech.Core.Enums;

namespace InfiniTech.Application.DTOs.Tickets;

public class AdminUpdateTicketDto
{
    public Guid? MasterId { get; set; }
    public TicketStatus? Status { get; set; }
    public string? DiagnosisResult { get; set; }
    public decimal? RepairCost { get; set; }
    public string? Comment { get; set; }
}
