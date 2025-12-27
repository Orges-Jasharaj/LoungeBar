namespace Project.Dtos.Responses
{
    public class TableOrderSummaryDto
    {
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public int TableNumber { get; set; }
        public List<OrderItemResponseDto> Items { get; set; }
    }
}

