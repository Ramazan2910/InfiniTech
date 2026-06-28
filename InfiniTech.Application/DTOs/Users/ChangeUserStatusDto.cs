using System.ComponentModel.DataAnnotations;

namespace InfiniTech.Application.DTOs.Users;

public class ChangeUserStatusDto
{
    [Required]
    public bool IsActive { get; set; }
}
