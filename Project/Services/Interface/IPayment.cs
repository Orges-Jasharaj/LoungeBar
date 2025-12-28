using Project.Dtos.Requests;
using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IPayment
    {
        Task<ResponseDto<bool>> CreatePayment(CreatePaymentDto createPaymentDto);
        Task<ResponseDto<List<PaymentResponseDto>>> GetAllPayments();
        Task<ResponseDto<List<PaymentResponseDto>>> GetPaymentsByOrder(int orderId);
    }
}
