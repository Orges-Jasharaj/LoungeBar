using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface ITableSessionService
    {
        Task<ResponseDto<string>> CreateTableSession(int tableNumber);

        Task<ResponseDto<bool>> ValidateTableSession(Guid sessionGuid, int tableNumber);

        Task<ResponseDto<List<TableOrderSummaryDto>>> GetTableActiveOrdersBySession(Guid sessionGuid, int tableNumber);
        
        Task<ResponseDto<List<TableOrderSummaryDto>>> GetTableActiveOrdersBySessionGuid(Guid sessionGuid);
    }
}
