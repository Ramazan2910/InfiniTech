namespace InfiniTech.Application.Settings;

public class FileStorageSettings
{
    public string UploadPath { get; set; } = "wwwroot/uploads";
    public long MaxFileSizeBytes { get; set; } = 10485760;
    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".webp"];
}
