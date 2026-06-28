namespace InfiniTech.Application.DTOs.Tickets;

public class AddCommentDto
{
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
}
