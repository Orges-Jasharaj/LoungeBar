namespace Project.Dtos.Responses
{
    public class OrderItemResponseDto
    {
        public int DrinkId { get; set; }
        public string DrinkName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total => UnitPrice * Quantity;
    }
}
