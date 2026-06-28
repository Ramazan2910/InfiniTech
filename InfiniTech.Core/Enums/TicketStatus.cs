namespace InfiniTech.Core.Enums;

public enum TicketStatus
{
    WaitingForMaster = 0,
    Diagnosis = 1,
    PriceApproval = 2,
    InRepair = 3,
    WaitingForParts = 4,
    ReadyForPickup = 5,
    Completed = 6,
    Cancelled = 7
}
