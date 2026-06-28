using InfiniTech.Core.Enums;

namespace InfiniTech.Application.DTOs.Users;

public class AdminCreateUserDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserRole Role { get; set; } = UserRole.Client;
}

public class ChangePasswordDto
{
    public string NewPassword { get; set; } = string.Empty;
}

public class ChangeOwnPasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
