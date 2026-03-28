using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IPdfService
    {
        byte[] GenerateInvoicePdf(OrderResponseDto order);
    }
}
