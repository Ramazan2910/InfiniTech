using InfiniTech.Core.Entities;

namespace InfiniTech.Application.Services.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
