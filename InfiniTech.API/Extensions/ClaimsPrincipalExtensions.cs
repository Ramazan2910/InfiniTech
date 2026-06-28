using System.Security.Claims;

namespace InfiniTech.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                 ?? principal.FindFirst("sub")?.Value;
        return Guid.TryParse(value, out var id) ? id : Guid.Empty;
    }

    public static string GetRole(this ClaimsPrincipal principal)
        => principal.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

    public static bool IsAdmin(this ClaimsPrincipal principal)
        => principal.IsInRole("Admin");

    public static bool IsMaster(this ClaimsPrincipal principal)
        => principal.IsInRole("Master");

    public static bool IsStaff(this ClaimsPrincipal principal)
        => principal.IsInRole("Master") || principal.IsInRole("Admin");
}
