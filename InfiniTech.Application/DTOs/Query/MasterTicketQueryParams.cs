using InfiniTech.Core.Enums;

namespace InfiniTech.Application.DTOs.Query;

public class MasterTicketQueryParams
{
    public TicketStatus? Status { get; set; }
    public DeviceType? DeviceType { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
