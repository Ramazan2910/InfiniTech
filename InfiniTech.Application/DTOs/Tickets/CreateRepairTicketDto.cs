using InfiniTech.Core.Enums;
using Microsoft.AspNetCore.Http;

namespace InfiniTech.Application.DTOs.Tickets;

public class CreateRepairTicketDto
{
    public DeviceType DeviceType { get; set; }
    public string DeviceBrand { get; set; } = string.Empty;
    public string DeviceModel { get; set; } = string.Empty;
    public string ProblemDescription { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public List<IFormFile>? Photos { get; set; }
}
