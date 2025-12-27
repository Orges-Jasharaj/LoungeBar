using Project.Dtos.Requests;
using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface ITable
    {
        Task<ResponseDto<bool>> CreateTable(CreateTableDto createTableDto);
        Task<ResponseDto<List<TableDto>>> GetAllTables();
        Task<ResponseDto<TableDto>> GetTableById(int tableId);
        Task<ResponseDto<TableDto>> GetTableByNumber(int tableNumber);
        Task<ResponseDto<List<TableOrderSummaryDto>>> GetTableActiveOrders(int tableNumber);
        Task<ResponseDto<bool>> HideTableLatestOrder(int tableNumber);
        Task<ResponseDto<bool>> UpdateTable(int tableId, CreateTableDto updateTableDto);
        Task<ResponseDto<bool>> DeleteTable(int tableId);
    }
}

