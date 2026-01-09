using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface ITableSessionService
    {
        /// <summary>
        /// Krijo një session GUID për tavolinë (kur klienti skanon QR code)
        /// </summary>
        Task<ResponseDto<string>> CreateTableSession(int tableNumber);

        /// <summary>
        /// Verifikon nëse GUID është valid për tavolinë
        /// </summary>
        Task<ResponseDto<bool>> ValidateTableSession(Guid sessionGuid, int tableNumber);

        /// <summary>
        /// Merr porositë aktive për tavolinë duke përdorur session GUID
        /// </summary>
        Task<ResponseDto<List<TableOrderSummaryDto>>> GetTableActiveOrdersBySession(Guid sessionGuid, int tableNumber);
        
        /// <summary>
        /// Merr porositë aktive për tavolinë duke përdorur vetëm session GUID (merr tableNumber nga cache)
        /// </summary>
        Task<ResponseDto<List<TableOrderSummaryDto>>> GetTableActiveOrdersBySessionGuid(Guid sessionGuid);
    }
}
