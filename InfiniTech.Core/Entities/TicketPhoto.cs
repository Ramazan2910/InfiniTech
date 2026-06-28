namespace InfiniTech.Core.Entities;

public class TicketPhoto
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public RepairTicket Ticket { get; set; } = null!;
}
