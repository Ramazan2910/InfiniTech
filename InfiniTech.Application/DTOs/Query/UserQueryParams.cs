using InfiniTech.Core.Enums;

namespace InfiniTech.Application.DTOs.Query;

public class UserQueryParams
{
    public UserRole? Role { get; set; }
    public bool? IsActive { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
