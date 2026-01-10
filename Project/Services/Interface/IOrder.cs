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
        Task<ResponseDto<PagedResponseDto<OrderResponseDto>>> GetOrders(int page = 1, int pageSize = 10, DateTime? from = null, DateTime? to = null, string? status = null);
        Task<ResponseDto<int?>> GetOrdersCount(DateTime? from = null, DateTime? to = null, string? status = null);
        Task<ResponseDto<bool>> UpdateOrderStatus(int orderId, string status);
        Task<ResponseDto<bool>> HideOrderFromCustomers(int orderId);
        Task<ResponseDto<bool>> DeleteOrder(int orderId);
        Task<ResponseDto<decimal>> GetTotalOrdersByShift(int shiftId);
        Task<ResponseDto<decimal>> GetTotalOrdersByMyCurrentShift();
        Task<ResponseDto<PagedResponseDto<OrderResponseDto>>> GetOrdersByTable(int tableId, int page = 1, int pageSize = 10);
        Task<ResponseDto<decimal>> GetTotalOrdersByWaiterId(string waiterId);
        Task<ResponseDto<List<OrderResponseDto>>> GetOrdersByWaiterId(string waiterId, int? shiftId = null);
        Task<ResponseDto<List<WaiterDailySalesDto>>> GetAllWaitersDailySales();

    }
}
