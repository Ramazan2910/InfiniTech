using InfiniTech.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace InfiniTech.Application.DTOs.Users;

public class ChangeUserRoleDto
{
    [Required]
    public UserRole Role { get; set; }
}
