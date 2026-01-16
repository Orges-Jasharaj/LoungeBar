using Project.Dtos.Responses;

namespace Project.Hubs
{
    public interface IOrderHub
    {
        Task OrderCreated(OrderResponseDto order);
        Task OrderUpdated(OrderResponseDto order);
        Task OrderStatusChanged(int orderId, string status, int tableId);
    }
}
