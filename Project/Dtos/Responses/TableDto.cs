namespace Project.Dtos.Responses
{
    public class TableDto
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public int Capacity { get; set; }
        public int TotalOrders { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

