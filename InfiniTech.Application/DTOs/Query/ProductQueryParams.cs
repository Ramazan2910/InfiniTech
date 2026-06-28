namespace InfiniTech.Application.DTOs.Query;

public class ProductQueryParams
{
    public int? CategoryId { get; set; }
    public string? Condition { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
    public string? SortBy { get; set; }
}
