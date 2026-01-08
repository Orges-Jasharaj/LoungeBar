using Project.Dtos.Requests;
using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IPayment
    {
        Task<ResponseDto<bool>> CreatePayment(CreatePaymentDto createPaymentDto);
        Task<ResponseDto<List<PaymentResponseDto>>> GetAllPayments();
        Task<ResponseDto<List<PaymentResponseDto>>> GetPaymentsByOrder(int orderId);
        Task<ResponseDto<PaymentSummaryDto>> GetPaymentSummary(DateTime? from = null, DateTime? to = null);
        Task<ResponseDto<PagedResponseDto<PaymentResponseDto>>> GetPayments(int page = 1, int pageSize = 10, DateTime? from = null, DateTime? to = null);
    }
}
