namespace Project.Dtos.Responses
{
    public class WaiterDailySalesDto
    {
        public string WaiterId { get; set; }
        public string WaiterName { get; set; }
        public string WaiterEmail { get; set; }
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public int ActiveShiftId { get; set; }
        public DateTime? ShiftStartTime { get; set; }
        public DateTime? ShiftEndTime { get; set; }
    }
}
