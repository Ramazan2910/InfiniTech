using Microsoft.AspNetCore.Http;

namespace InfiniTech.Application.Services.Interfaces;

public interface IFileService
{
    Task<string> SaveProductImageAsync(IFormFile file);
    Task<string> SaveTicketPhotoAsync(IFormFile file, Guid ticketId);
    Task DeleteFileAsync(string relativePath);
    bool IsValidFile(IFormFile file);
}
