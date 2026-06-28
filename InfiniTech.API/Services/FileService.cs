using InfiniTech.Application.Services.Interfaces;
using InfiniTech.Application.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace InfiniTech.API.Services;

public class FileService : IFileService
{
    private readonly string _webRootPath;
    private readonly FileStorageSettings _settings;

    public FileService(IWebHostEnvironment env, IOptions<FileStorageSettings> settings)
    {
        _webRootPath = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        _settings = settings.Value;
    }

    public bool IsValidFile(IFormFile file)
    {
        if (file.Length == 0 || file.Length > _settings.MaxFileSizeBytes)
            return false;

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        return _settings.AllowedExtensions.Contains(ext);
    }

    public async Task<string> SaveProductImageAsync(IFormFile file)
    {
        var dir = Path.Combine(_webRootPath, "uploads", "products");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(dir, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/products/{fileName}";
    }

    public async Task<string> SaveTicketPhotoAsync(IFormFile file, Guid ticketId)
    {
        var dir = Path.Combine(_webRootPath, "uploads", "tickets", ticketId.ToString());
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(dir, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/tickets/{ticketId}/{fileName}";
    }

    public Task DeleteFileAsync(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath)) return Task.CompletedTask;
        var fullPath = Path.Combine(_webRootPath, relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(fullPath)) File.Delete(fullPath);
        return Task.CompletedTask;
    }
}
