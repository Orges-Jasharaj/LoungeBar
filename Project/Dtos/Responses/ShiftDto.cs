using Project.Data.Enums;

namespace Project.Dtos.Responses
{
    public class ShiftDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public ShiftType ShiftType { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool IsActive { get; set; }
        public string? Notes { get; set; }
    }
}
