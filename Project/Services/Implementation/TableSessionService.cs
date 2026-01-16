using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Project.Data;
using Project.Data.Enums;
using Project.Dtos.Responses;
using Project.Services.Interface;

namespace Project.Services.Implementation
{
    public class TableSessionService : ITableSessionService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<TableSessionService> _logger;

        private readonly TimeSpan _sessionExpiration = TimeSpan.FromHours(24);

        public TableSessionService(
            AppDbContext context,
            IMemoryCache memoryCache,
            ILogger<TableSessionService> logger)
        {
            _context = context;
            _memoryCache = memoryCache;
            _logger = logger;
        }

        public async Task<ResponseDto<string>> CreateTableSession(int tableNumber)
        {
            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Number == tableNumber);

            if (table == null)
            {
                return ResponseDto<string>.Failure($"Table with number {tableNumber} not found.");
            }

            await InvalidateOldSessionsForTable(tableNumber);

            var sessionGuid = Guid.NewGuid();
            var cacheKey = $"table_session_{sessionGuid}";
            var tableSessionKey = $"table_{tableNumber}_current_session";

            var cacheEntryOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = _sessionExpiration,
                SlidingExpiration = TimeSpan.FromHours(1) 
            };

            _memoryCache.Set(cacheKey, tableNumber, cacheEntryOptions);
            _memoryCache.Set(tableSessionKey, sessionGuid, cacheEntryOptions);

            _logger.LogInformation(
                "Table session created: GUID={SessionGuid}, TableNumber={TableNumber} (old sessions invalidated)",
                sessionGuid,
                tableNumber
            );

            return ResponseDto<string>.SuccessResponse(
                sessionGuid.ToString(),
                "Table session created successfully."
            );
        }

        private async Task InvalidateOldSessionsForTable(int tableNumber)
        {
            var tableSessionKey = $"table_{tableNumber}_current_session";
            
            if (_memoryCache.TryGetValue(tableSessionKey, out Guid oldSessionGuid))
            {
                var oldCacheKey = $"table_session_{oldSessionGuid}";
                _memoryCache.Remove(oldCacheKey);
                
                _logger.LogInformation(
                    "Invalidated old session: GUID={OldSessionGuid}, TableNumber={TableNumber}",
                    oldSessionGuid,
                    tableNumber
                );
            }
        }

        public async Task<ResponseDto<bool>> ValidateTableSession(Guid sessionGuid, int tableNumber)
        {
            var cacheKey = $"table_session_{sessionGuid}";

            if (!_memoryCache.TryGetValue(cacheKey, out int cachedTableNumber))
            {
                _logger.LogWarning(
                    "Invalid table session: GUID={SessionGuid} not found in cache",
                    sessionGuid
                );
                return ResponseDto<bool>.Failure("Invalid or expired session.");
            }

            if (cachedTableNumber != tableNumber)
            {
                _logger.LogWarning(
                    "Table number mismatch: GUID={SessionGuid}, Expected={ExpectedTableNumber}, Got={GotTableNumber}",
                    sessionGuid,
                    tableNumber,
                    cachedTableNumber
                );
                return ResponseDto<bool>.Failure("Table number mismatch.");
            }

            var tableExists = await _context.Tables
                .AnyAsync(t => t.Number == tableNumber);

            if (!tableExists)
            {
                return ResponseDto<bool>.Failure("Table not found.");
            }

            return ResponseDto<bool>.SuccessResponse(true, "Session is valid.");
        }

        public async Task<ResponseDto<List<TableOrderSummaryDto>>> GetTableActiveOrdersBySession(Guid sessionGuid, int tableNumber)
        {
            var validationResult = await ValidateTableSession(sessionGuid, tableNumber);
            if (!validationResult.Success)
            {
                return ResponseDto<List<TableOrderSummaryDto>>.Failure(validationResult.Message);
            }

            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Number == tableNumber);

            if (table == null)
            {
                return ResponseDto<List<TableOrderSummaryDto>>.Failure("Table not found.");
            }

            var activeOrders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Drink)
                .Include(o => o.Table)
                .Where(o => o.TableId == table.Id 
                    && o.IsVisibleToCustomers == true
                    && o.Status != OrderStatus.Paid
                    && o.Status != OrderStatus.Canceled)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            if (activeOrders == null || !activeOrders.Any())
            {
                return ResponseDto<List<TableOrderSummaryDto>>.SuccessResponse(
                    new List<TableOrderSummaryDto>(),
                    "No active orders found for this table."
                );
            }

            var ordersSummary = activeOrders.Select(order => new TableOrderSummaryDto
            {
                Status = order.Status.ToString(),
                TotalAmount = order.TotalAmount,
                TableNumber = order.Table?.Number ?? tableNumber,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    DrinkId = oi.DrinkId,
                    DrinkName = oi.Drink.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            }).ToList();

            _logger.LogInformation(
                "{Count} active orders retrieved for table {TableNumber} via session {SessionGuid}",
                ordersSummary.Count,
                tableNumber,
                sessionGuid
            );

            return ResponseDto<List<TableOrderSummaryDto>>.SuccessResponse(
                ordersSummary,
                "Active orders retrieved successfully."
            );
        }

        public async Task<ResponseDto<List<TableOrderSummaryDto>>> GetTableActiveOrdersBySessionGuid(Guid sessionGuid)
        {
            var cacheKey = $"table_session_{sessionGuid}";

            if (!_memoryCache.TryGetValue(cacheKey, out int tableNumber))
            {
                _logger.LogWarning(
                    "Invalid table session: GUID={SessionGuid} not found in cache",
                    sessionGuid
                );
                return ResponseDto<List<TableOrderSummaryDto>>.Failure("Invalid or expired session.");
            }

            return await GetTableActiveOrdersBySession(sessionGuid, tableNumber);
        }
    }
}
