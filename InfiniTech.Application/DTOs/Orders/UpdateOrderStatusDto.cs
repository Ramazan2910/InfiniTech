using InfiniTech.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace InfiniTech.Application.DTOs.Orders;

public class UpdateOrderStatusDto
{
    [Required]
    public OrderStatus Status { get; set; }
}
