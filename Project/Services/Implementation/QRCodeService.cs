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

            // Përdor baseUrl nga parameter, ose nga configuration, ose default
            var baseUrlToUse = baseUrl 
                ?? _configuration["FrontendBaseUrl"] 
                ?? "http://localhost:3000";

            // URL që do të jetë në QR code
            // Format: {baseUrl}/table-{tableNumber}
            // Kur klienti skanon, do të krijohet session dhe do të ridrejtohet në /{guid}/table-{tableNumber}
            var qrCodeData = $"{baseUrlToUse}/table-{tableNumber}";
            
            // Gjenero QR Code
            var qrCodeBytes = GenerateQRCode(qrCodeData);

            // Ruaj QR Code në database
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
