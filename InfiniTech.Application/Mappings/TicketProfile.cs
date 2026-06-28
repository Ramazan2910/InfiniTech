using AutoMapper;
using InfiniTech.Application.DTOs.Tickets;
using InfiniTech.Core.Entities;

namespace InfiniTech.Application.Mappings;

public class TicketProfile : Profile
{
    public TicketProfile()
    {
        CreateMap<RepairTicket, RepairTicketDto>()
            .ForMember(d => d.DeviceType, o => o.MapFrom(s => s.DeviceType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ClientName, o => o.MapFrom(s =>
                s.Client != null ? $"{s.Client.FirstName} {s.Client.LastName}" : string.Empty))
            .ForMember(d => d.ClientEmail, o => o.MapFrom(s =>
                s.Client != null ? s.Client.Email : string.Empty))
            .ForMember(d => d.MasterName, o => o.MapFrom(s =>
                s.Master != null ? $"{s.Master.FirstName} {s.Master.LastName}" : null));

        CreateMap<TicketPhoto, TicketPhotoDto>();

        CreateMap<TicketComment, TicketCommentDto>()
            .ForMember(d => d.AuthorName, o => o.MapFrom(s =>
                s.Author != null ? $"{s.Author.FirstName} {s.Author.LastName}" : string.Empty));

        CreateMap<CreateRepairTicketDto, RepairTicket>()
            .ForMember(d => d.Id, o => o.MapFrom(_ => Guid.NewGuid()))
            .ForMember(d => d.CreatedAt, o => o.MapFrom(_ => DateTime.UtcNow))
            .ForMember(d => d.UpdatedAt, o => o.MapFrom(_ => DateTime.UtcNow))
            .ForMember(d => d.Photos, o => o.Ignore())
            .ForMember(d => d.Photos, o => o.Ignore());
    }
}
