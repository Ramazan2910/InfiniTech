using System.ComponentModel.DataAnnotations;

namespace InfiniTech.Application.DTOs.Cart;

public class UpdateCartItemDto
{
    [Required, Range(1, 9999)]
    public int Quantity { get; set; }
}
