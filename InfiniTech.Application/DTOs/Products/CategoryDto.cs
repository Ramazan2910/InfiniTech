namespace InfiniTech.Application.DTOs.Products;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string IconEmoji { get; set; } = string.Empty;
}
