using Project.Dtos.Requests;
using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IOrder
    {
        Task<ResponseDto<bool>> CreateOrder(CreateOrderRequestDto createOrderDto);
        Task<ResponseDto<List<OrderResponseDto>>> GetMyOrders();
        Task<ResponseDto<OrderResponseDto>> GetOrderById(int orderId);
        Task<ResponseDto<List<OrderResponseDto>>> GetAllOrders();
        Task<ResponseDto<bool>> UpdateOrderStatus(int orderId, string status);
        Task<ResponseDto<bool>> HideOrderFromCustomers(int orderId);
        Task<ResponseDto<bool>> DeleteOrder(int orderId);
    }
}
