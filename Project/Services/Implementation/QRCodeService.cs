using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Project.Data;
using Project.Dtos.Responses;
using Project.Services.Interface;
using QRCoder;

namespace Project.Services.Implementation
{
    public class QRCodeService : IQRCodeService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<QRCodeService> _logger;
        private readonly IConfiguration _configuration;

        public QRCodeService(
            AppDbContext context,
            ILogger<QRCodeService> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        public byte[] GenerateQRCode(string data, int size = 300)
        {
            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
                using (PngByteQRCode qrCode = new PngByteQRCode(qrCodeData))
                {
                    return qrCode.GetGraphic(20);
                }
            }
        }

        public async Task<ResponseDto<byte[]>> GenerateAndSaveQRCodeForTable(int tableNumber, string? baseUrl = null)
        {
            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Number == tableNumber);

            if (table == null)
            {
                return ResponseDto<byte[]>.Failure($"Table with number {tableNumber} not found.");
            }

            var baseUrlToUse = baseUrl 
                ?? _configuration["FrontendBaseUrl"] 
                ?? "http://localhost:3000";

            var qrCodeData = $"{baseUrlToUse}/table-{tableNumber}";
            
            var qrCodeBytes = GenerateQRCode(qrCodeData);

            table.QRCodeImage = qrCodeBytes;
            table.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "QR Code generated and saved for table {TableNumber}",
                tableNumber
            );

            return ResponseDto<byte[]>.SuccessResponse(
                qrCodeBytes,
                "QR Code generated and saved successfully."
            );
        }
    }
}
