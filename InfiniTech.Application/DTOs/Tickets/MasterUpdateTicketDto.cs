using InfiniTech.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace InfiniTech.Application.DTOs.Tickets;

public class MasterUpdateTicketDto
{
    [Required]
    public TicketStatus Status { get; set; }
    public string? DiagnosisResult { get; set; }
    public decimal? RepairCost { get; set; }
    public string? Comment { get; set; }
}
