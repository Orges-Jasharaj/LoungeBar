namespace Project.Dtos.Responses
{
    public class StatisticsOverviewDto
    {
        public int TotalUsers { get; set; }
        public int TotalTables { get; set; }
        public int TotalOrders { get; set; }
        public decimal RevenuePaid { get; set; }
        public decimal AverageOrderValuePaid { get; set; }
        public int PaymentsCount { get; set; }
        public int ReservationsCount { get; set; }
        public int ActiveShifts { get; set; }
    }
}

