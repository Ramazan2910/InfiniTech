using InfiniTech.Core.Enums;

namespace InfiniTech.Application.DTOs.Query;

public class AdminTicketQueryParams
{
    public TicketStatus? Status { get; set; }
    public Guid? MasterId { get; set; }
    public Guid? ClientId { get; set; }
    public DeviceType? DeviceType { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
