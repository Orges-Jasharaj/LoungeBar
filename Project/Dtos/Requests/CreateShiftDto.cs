using Project.Data.Enums;

namespace Project.Dtos.Requests
{
    public class CreateShiftDto
    {
        public string UserId { get; set; }
        public ShiftType ShiftType { get; set; }
        public DateTime? StartTime { get; set; }
        public string? Notes { get; set; }
    }
}
