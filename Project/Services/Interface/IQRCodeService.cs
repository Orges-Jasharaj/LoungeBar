using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IQRCodeService
    {
        byte[] GenerateQRCode(string data, int size = 300);

        Task<ResponseDto<byte[]>> GenerateAndSaveQRCodeForTable(int tableNumber, string baseUrl = "http://localhost:3000");
    }
}
