using InfiniTech.Core.Enums;

namespace InfiniTech.Application.DTOs.Query;

public class AdminOrderQueryParams
{
    public OrderStatus? Status { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
