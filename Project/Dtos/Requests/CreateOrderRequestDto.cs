namespace Project.Dtos.Requests
{
    public class CreateOrderRequestDto
    {
        public int TableNumber { get; set; }
        public List<CreateOrderItemRequestDto> Items { get; set; }
    }
}
