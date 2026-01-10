namespace Project.Dtos.Responses
{
    public class OrderResponseDto
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public int TableId { get; set; }
        public int TableNumber { get; set; }
        public string? UserId { get; set; }
        public string? UserName { get; set; }
        public List<OrderItemResponseDto> Items { get; set; }
    }
}
