using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IQRCodeService
    {
        /// <summary>
        /// Gjeneron QR Code image për tavolinë (në byte array)
        /// </summary>
        byte[] GenerateQRCode(string data, int size = 300);

        /// <summary>
        /// Gjeneron dhe ruan QR Code për tavolinë
        /// </summary>
        Task<ResponseDto<byte[]>> GenerateAndSaveQRCodeForTable(int tableNumber, string baseUrl = "http://localhost:3000");
    }
}
