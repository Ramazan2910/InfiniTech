using InfiniTech.Core.Enums;

namespace InfiniTech.Core.Entities;

public class RepairTicket
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public Guid? MasterId { get; set; }
    public DeviceType DeviceType { get; set; }
    public string DeviceBrand { get; set; } = string.Empty;
    public string DeviceModel { get; set; } = string.Empty;
    public string ProblemDescription { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public TicketStatus Status { get; set; } = TicketStatus.WaitingForMaster;
    public string? DiagnosisResult { get; set; }
    public decimal? RepairCost { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public User Client { get; set; } = null!;
    public User? Master { get; set; }
    public ICollection<TicketPhoto> Photos { get; set; } = new List<TicketPhoto>();
    public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
}
