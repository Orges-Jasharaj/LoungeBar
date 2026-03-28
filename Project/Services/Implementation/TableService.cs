using Microsoft.EntityFrameworkCore;
using Project.Data;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Dtos.Responses;
using Project.Services.Interface;

namespace Project.Services.Implementation
{
    public class TableService : ITable
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TableService> _logger;
        private readonly CurrentUserService _currentUserService;

        public TableService(
            AppDbContext context,
            ILogger<TableService> logger,
            CurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<ResponseDto<bool>> CreateTable(CreateTableDto createTableDto)
        {
            var tableExists = await _context.Tables
                .AnyAsync(t => t.Number == createTableDto.Number);

            if (tableExists)
            {
                return ResponseDto<bool>.Failure("A table with the same number already exists.");
            }

            var userId = _currentUserService.GetCurrentUserId();

            var table = new Table
            {
                Number = createTableDto.Number,
                Capacity = createTableDto.Capacity,
                CreatedBy = userId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            _context.Tables.Add(table);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Table {TableNumber} created by {UserId}",
                table.Number,
                userId
            );

            return ResponseDto<bool>.SuccessResponse(true, "Table created successfully.");
        }

        public async Task<ResponseDto<List<TableDto>>> GetAllTables()
        {
            var tables = await _context.Tables
                .Include(t => t.Orders)
                .Select(t => new TableDto
                {
                    Id = t.Id,
                    Number = t.Number,
                    Capacity = t.Capacity,
                    TotalOrders = t.Orders != null ? t.Orders.Count : 0,
                    QRCodeImage = t.QRCodeImage,
                    CreatedBy = t.CreatedBy,
                    CreatedAt = t.CreatedAt,
                    UpdatedBy = t.UpdatedBy,
                    UpdatedAt = t.UpdatedAt
                })
                .OrderBy(t => t.Number)
                .ToListAsync();

            return ResponseDto<List<TableDto>>.SuccessResponse(tables, "Tables retrieved successfully.");
        }

        public async Task<ResponseDto<TableDto>> GetTableById(int tableId)
        {
            var table = await _context.Tables
                .Include(t => t.Orders)
                .Where(t => t.Id == tableId)
                .Select(t => new TableDto
                {
                    Id = t.Id,
                    Number = t.Number,
                    Capacity = t.Capacity,
                    TotalOrders = t.Orders != null ? t.Orders.Count : 0,
                    QRCodeImage = t.QRCodeImage,
                    CreatedBy = t.CreatedBy,
                    CreatedAt = t.CreatedAt,
                    UpdatedBy = t.UpdatedBy,
                    UpdatedAt = t.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (table == null)
            {
                return ResponseDto<TableDto>.Failure("Table not found.");
            }

            return ResponseDto<TableDto>.SuccessResponse(table, "Table retrieved successfully.");
        }

        public async Task<ResponseDto<TableDto>> GetTableByNumber(int tableNumber)
        {
            var table = await _context.Tables
                .Include(t => t.Orders)
                .Where(t => t.Number == tableNumber)
                .Select(t => new TableDto
                {
                    Id = t.Id,
                    Number = t.Number,
                    Capacity = t.Capacity,
                    TotalOrders = t.Orders != null ? t.Orders.Count : 0,
                    QRCodeImage = t.QRCodeImage,
                    CreatedBy = t.CreatedBy,
                    CreatedAt = t.CreatedAt,
                    UpdatedBy = t.UpdatedBy,
                    UpdatedAt = t.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (table == null)
            {
                return ResponseDto<TableDto>.Failure("Table not found.");
            }

            return ResponseDto<TableDto>.SuccessResponse(table, "Table retrieved successfully.");
        }

        public async Task<ResponseDto<List<TableOrderSummaryDto>>> GetTableActiveOrders(int tableNumber)
        {
            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Number == tableNumber);

            if (table == null)
            {
                return ResponseDto<List<TableOrderSummaryDto>>.Failure("Table not found.");
            }

            var activeOrders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .Include(o => o.Table)
                .Where(o => o.TableId == table.Id 
                    && o.IsVisibleToCustomers == true
                    && o.Status != Project.Data.Enums.OrderStatus.Paid
                    && o.Status != Project.Data.Enums.OrderStatus.Canceled)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            if (activeOrders == null || !activeOrders.Any())
            {
                return ResponseDto<List<TableOrderSummaryDto>>.Failure("No active orders found for this table.");
            }

            var ordersSummary = activeOrders.Select(order => new TableOrderSummaryDto
            {
                Status = order.Status.ToString(),
                TotalAmount = order.TotalAmount,
                TableNumber = order.Table?.Number ?? tableNumber,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    MenuItemId = oi.MenuItemId,
                    MenuItemName = oi.MenuItem.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            }).ToList();

            _logger.LogInformation(
                "{Count} active orders retrieved for table {TableNumber}",
                ordersSummary.Count,
                tableNumber
            );

            return ResponseDto<List<TableOrderSummaryDto>>.SuccessResponse(
                ordersSummary,
                "Active orders retrieved successfully."
            );
        }

        public async Task<ResponseDto<bool>> HideTableLatestOrder(int tableNumber)
        {
            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Number == tableNumber);

            if (table == null)
            {
                return ResponseDto<bool>.Failure("Table not found.");
            }

            var activeOrders = await _context.Orders
                .Where(o => o.TableId == table.Id
                    && o.IsVisibleToCustomers == true
                    && o.Status != Project.Data.Enums.OrderStatus.Paid
                    && o.Status != Project.Data.Enums.OrderStatus.Canceled)
                .ToListAsync();

            if (activeOrders == null || !activeOrders.Any())
            {
                return ResponseDto<bool>.Failure("No active orders found for this table.");
            }

            foreach (var order in activeOrders)
            {
                order.IsVisibleToCustomers = false;
                order.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "{Count} active orders for table {TableNumber} hidden from customers",
                activeOrders.Count,
                tableNumber
            );

            return ResponseDto<bool>.SuccessResponse(true, $"All {activeOrders.Count} active orders hidden from customers successfully.");
        }

        public async Task<ResponseDto<bool>> UpdateTable(int tableId, CreateTableDto updateTableDto)
        {
            var table = await _context.Tables.FindAsync(tableId);

            if (table == null)
            {
                return ResponseDto<bool>.Failure("Table not found.");
            }

            if (table.Number != updateTableDto.Number)
            {
                var numberExists = await _context.Tables
                    .AnyAsync(t => t.Number == updateTableDto.Number && t.Id != tableId);

                if (numberExists)
                {
                    return ResponseDto<bool>.Failure("A table with the same number already exists.");
                }
            }

            table.Number = updateTableDto.Number;
            table.Capacity = updateTableDto.Capacity;
            table.UpdatedBy = _currentUserService.GetCurrentUserId() ?? "System";
            table.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Table {TableId} updated by {UserId}",
                tableId,
                _currentUserService.GetCurrentUserId()
            );

            return ResponseDto<bool>.SuccessResponse(true, "Table updated successfully.");
        }

        public async Task<ResponseDto<bool>> DeleteTable(int tableId)
        {
            var table = await _context.Tables
                .Include(t => t.Orders)
                .FirstOrDefaultAsync(t => t.Id == tableId);

            if (table == null)
            {
                return ResponseDto<bool>.Failure("Table not found.");
            }

            var hasActiveOrders = table.Orders != null && table.Orders
                .Any(o => o.Status != Project.Data.Enums.OrderStatus.Paid && 
                          o.Status != Project.Data.Enums.OrderStatus.Canceled);

            if (hasActiveOrders)
            {
                return ResponseDto<bool>.Failure("Cannot delete table with active orders. Please complete or cancel all orders first.");
            }

            _context.Tables.Remove(table);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Table {TableId} deleted by {UserId}",
                tableId,
                _currentUserService.GetCurrentUserId()
            );

            return ResponseDto<bool>.SuccessResponse(true, "Table deleted successfully.");
        }
    }
}

