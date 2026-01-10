using Microsoft.EntityFrameworkCore;
using Project.Data;
using Project.Data.Enums;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Dtos.Responses;
using Project.Services.Interface;

namespace Project.Services.Implementation
{
    public class OrderService : IOrder
    {
        private readonly AppDbContext _context;
        private readonly ILogger<OrderService> _logger;
        private readonly CurrentUserService _currentUserService;

        public OrderService(
            AppDbContext context,
            ILogger<OrderService> logger,
            CurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<ResponseDto<bool>> CreateOrder(CreateOrderRequestDto createOrderDto)
        {
            var userId = _currentUserService.GetCurrentUserId();

            if (createOrderDto.Items == null || !createOrderDto.Items.Any())
            {
                return ResponseDto<bool>.Failure("Order must contain at least one drink.");
            }

            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Number == createOrderDto.TableNumber);

            if (table == null)
            {
                return ResponseDto<bool>.Failure($"Table with number {createOrderDto.TableNumber} not found.");
            }

            // Gjej shift-in aktiv të kamarierit
            var activeShift = await _context.Shifts
                .FirstOrDefaultAsync(s => s.UserId == userId && s.EndTime == null);

            var order = new Order
            {
                UserId = userId,
                TableId = table.Id,
                ShiftId = activeShift?.Id,
                CreatedBy = userId ?? "System",
                CreatedAt = DateTime.UtcNow,
                Status = OrderStatus.Pending,
                OrderItems = new List<OrderItem>()
            };

            decimal totalAmount = 0;

            foreach (var item in createOrderDto.Items)
            {
                var drink = await _context.Drinks
                    .FirstOrDefaultAsync(d => d.Id == item.DrinkId && d.IsAvailable);

                if (drink == null)
                {
                    return ResponseDto<bool>.Failure($"Drink with ID {item.DrinkId} not found or unavailable.");
                }

                order.OrderItems.Add(new OrderItem
                {
                    DrinkId = drink.Id,
                    Quantity = item.Quantity,
                    UnitPrice = drink.Price
                });

                totalAmount += drink.Price * item.Quantity;
            }

            order.TotalAmount = totalAmount;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Order {OrderId} created by {UserId} with total {Total}",
                order.Id,
                userId,
                totalAmount
            );

            return ResponseDto<bool>.SuccessResponse(true, "Order created successfully.");
        }

        public async Task<ResponseDto<List<OrderResponseDto>>> GetMyOrders()
        {
            var userId = _currentUserService.GetCurrentUserId();

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Drink)
                .Include(o => o.Table)
                .Include(o => o.User)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var result = orders.Select(MapToOrderResponse).ToList();

            return ResponseDto<List<OrderResponseDto>>
                .SuccessResponse(result, "Orders retrieved successfully.");
        }

        public async Task<ResponseDto<OrderResponseDto>> GetOrderById(int orderId)
        {
            var userId = _currentUserService.GetCurrentUserId();

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Drink)
                .Include(o => o.Table)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null)
            {
                return ResponseDto<OrderResponseDto>.Failure("Order not found.");
            }

            return ResponseDto<OrderResponseDto>
                .SuccessResponse(MapToOrderResponse(order), "Order retrieved successfully.");
        }

        public async Task<ResponseDto<bool>> UpdateOrderStatus(int orderId, string status)
        {
            var userId = _currentUserService.GetCurrentUserId();
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return ResponseDto<bool>.Failure("Order not found.");
            }

            // Kontrollojmë nëse porosia i përket kamarierit aktual
            if (order.UserId != userId)
            {
                return ResponseDto<bool>.Failure("You can only update your own orders.");
            }

            if (!Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
            {
                return ResponseDto<bool>.Failure("Invalid order status.");
            }

            order.Status = parsedStatus;
            
            if (parsedStatus == Project.Data.Enums.OrderStatus.Paid || 
                parsedStatus == Project.Data.Enums.OrderStatus.Canceled)
            {
                order.IsVisibleToCustomers = false;
            }
            
            order.UpdatedBy = _currentUserService.GetCurrentUserId() ?? "System";
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Order {OrderId} status updated to {Status} by {UserId}",
                orderId,
                parsedStatus,
                order.UpdatedBy
            );

            return ResponseDto<bool>.SuccessResponse(true, "Order status updated successfully.");
        }

        public async Task<ResponseDto<bool>> HideOrderFromCustomers(int orderId)
        {
            var userId = _currentUserService.GetCurrentUserId();
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return ResponseDto<bool>.Failure("Order not found.");
            }

            if (order.UserId != userId)
            {
                return ResponseDto<bool>.Failure("You can only hide your own orders.");
            }

            order.IsVisibleToCustomers = false;
            order.UpdatedBy = userId ?? "System";
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Order {OrderId} hidden from customers by {UserId}",
                orderId,
                userId
            );

            return ResponseDto<bool>.SuccessResponse(true, "Order hidden from customers successfully.");
        }

        public async Task<ResponseDto<bool>> DeleteOrder(int orderId)
        {
            var userId = _currentUserService.GetCurrentUserId();
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return ResponseDto<bool>.Failure("Order not found.");
            }

            // Kontrollojmë nëse porosia i përket kamarierit aktual
            if (order.UserId != userId)
            {
                return ResponseDto<bool>.Failure("You can only delete your own orders.");
            }

            _context.OrderItems.RemoveRange(order.OrderItems);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Order {OrderId} deleted by {UserId}",
                orderId,
                userId
            );

            return ResponseDto<bool>.SuccessResponse(true, "Order deleted successfully.");
        }
        

        public async Task<ResponseDto<List<OrderResponseDto>>> GetAllOrders()
        {
            var orders = await _context.Orders
    .Include(o => o.User)
    .Include(o => o.Table)
    .Include(o => o.OrderItems)
        .ThenInclude(oi => oi.Drink)
    .OrderByDescending(o => o.CreatedAt)
    .Skip(0)
    .Take(10)
    .ToListAsync();


            var result = orders.Select(MapToOrderResponse).ToList();

            _logger.LogInformation(
                "All orders retrieved. Total count: {Count}",
                result.Count
            );

            return ResponseDto<List<OrderResponseDto>>
                .SuccessResponse(result, "All orders retrieved successfully.");
        }

        public async Task<ResponseDto<PagedResponseDto<OrderResponseDto>>> GetOrders(int page = 1, int pageSize = 10, DateTime? from = null, DateTime? to = null, string? status = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.Table)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Drink)
                .AsQueryable();

            if (from.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(o => o.CreatedAt <= to.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<OrderStatus>(status, true, out var statusEnum))
                {
                    query = query.Where(o => o.Status == statusEnum);
                }
            }

            var totalCount = await query.CountAsync();

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = orders.Select(MapToOrderResponse).ToList();

            var pagedResponse = new PagedResponseDto<OrderResponseDto>
            {
                Items = result,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            _logger.LogInformation(
                "Orders retrieved with filters. Page: {Page}, PageSize: {PageSize}, Total: {TotalCount}",
                page,
                pageSize,
                totalCount
            );

            return ResponseDto<PagedResponseDto<OrderResponseDto>>.SuccessResponse(
                pagedResponse,
                "Orders retrieved successfully."
            );
        }

        public async Task<ResponseDto<int?>> GetOrdersCount(DateTime? from = null, DateTime? to = null, string? status = null)
        {
            var query = _context.Orders.AsQueryable();

            if (from.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(o => o.CreatedAt <= to.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<OrderStatus>(status, true, out var statusEnum))
                {
                    query = query.Where(o => o.Status == statusEnum);
                }
            }

            var count = await query.CountAsync();

            _logger.LogInformation(
                "Orders count retrieved. Count: {Count}",
                count
            );

            return ResponseDto<int?>.SuccessResponse(count, "Orders count retrieved successfully.");
        }

        public async Task<ResponseDto<decimal>> GetTotalOrdersByShift(int shiftId)
        {
            var shift = await _context.Shifts.FindAsync(shiftId);
            
            if (shift == null)
            {
                return ResponseDto<decimal>.Failure("Shift not found.");
            }

            var total = await _context.Orders
                .Where(o => o.ShiftId == shiftId)
                .SumAsync(o => o.TotalAmount);

            _logger.LogInformation(
                "Total orders for shift {ShiftId} retrieved: {Total}",
                shiftId,
                total
            );

            return ResponseDto<decimal>.SuccessResponse(total, "Total orders for shift retrieved successfully.");
        }

        public async Task<ResponseDto<decimal>> GetTotalOrdersByMyCurrentShift()
        {
            var userId = _currentUserService.GetCurrentUserId();

            var activeShift = await _context.Shifts
                .FirstOrDefaultAsync(s => s.UserId == userId && s.EndTime == null);

            if (activeShift == null)
            {
                return ResponseDto<decimal>.Failure("No active shift found for the current user.");
            }

            var total = await _context.Orders
                .Where(o => o.ShiftId == activeShift.Id)
                .SumAsync(o => o.TotalAmount);

            _logger.LogInformation(
                "Total orders for current shift {ShiftId} of user {UserId} retrieved: {Total}",
                activeShift.Id,
                userId,
                total
            );

            return ResponseDto<decimal>.SuccessResponse(total, "Total orders for current shift retrieved successfully.");
        }

        public async Task<ResponseDto<PagedResponseDto<OrderResponseDto>>> GetOrdersByTable(int tableId, int page = 1, int pageSize = 10)
        {
            var userId = _currentUserService.GetCurrentUserId();

            // Validimi i parametrave
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            // Verifikojmë nëse tavolina ekziston
            var table = await _context.Tables.FindAsync(tableId);
            if (table == null)
            {
                return ResponseDto<PagedResponseDto<OrderResponseDto>>.Failure("Table not found.");
            }

            var totalCount = await _context.Orders
                .Where(o => o.TableId == tableId && o.UserId == userId)
                .CountAsync();

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Drink)
                .Include(o => o.Table)
                .Include(o => o.User)
                .Where(o => o.TableId == tableId && o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var orderDtos = orders.Select(MapToOrderResponse).ToList();

            var pagedResponse = new PagedResponseDto<OrderResponseDto>
            {
                Items = orderDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            _logger.LogInformation(
                "Orders for table {TableId} retrieved. Page: {Page}, PageSize: {PageSize}, Total: {TotalCount}",
                tableId,
                page,
                pageSize,
                totalCount
            );

            return ResponseDto<PagedResponseDto<OrderResponseDto>>.SuccessResponse(
                pagedResponse,
                "Orders retrieved successfully."
            );
        }

        public async Task<ResponseDto<decimal>> GetTotalOrdersByWaiterId(string waiterId)
        {
            var activeShift = await _context.Shifts
                .FirstOrDefaultAsync(s => s.UserId == waiterId && s.EndTime == null);

            if (activeShift == null)
            {
                return ResponseDto<decimal>.SuccessResponse(0, "No active shift found for this waiter.");
            }

            var total = await _context.Orders
                .Where(o => o.ShiftId == activeShift.Id && o.UserId == waiterId)
                .SumAsync(o => o.TotalAmount);

            _logger.LogInformation(
                "Total orders for waiter {WaiterId} in active shift {ShiftId} retrieved: {Total}",
                waiterId,
                activeShift.Id,
                total
            );

            return ResponseDto<decimal>.SuccessResponse(total, "Total orders for waiter's shift retrieved successfully.");
        }

        public async Task<ResponseDto<List<OrderResponseDto>>> GetOrdersByWaiterId(string waiterId, int? shiftId = null)
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Drink)
                .Include(o => o.Table)
                .Include(o => o.User)
                .Where(o => o.UserId == waiterId)
                .AsQueryable();

            if (shiftId.HasValue)
            {
                var shift = await _context.Shifts.FindAsync(shiftId.Value);
                
                if (shift == null)
                {
                    return ResponseDto<List<OrderResponseDto>>.Failure("Shift not found.");
                }

                query = query.Where(o => o.ShiftId == shiftId.Value);
                
                if (shift.StartTime.HasValue)
                {
                    query = query.Where(o => o.CreatedAt >= shift.StartTime.Value);
                    
                    var endTimeFilter = shift.EndTime ?? DateTime.UtcNow;
                    query = query.Where(o => o.CreatedAt <= endTimeFilter);
                }
            }

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var result = orders.Select(MapToOrderResponse).ToList();

            _logger.LogInformation(
                "Orders for waiter {WaiterId} retrieved. Count: {Count}",
                waiterId,
                result.Count
            );

            return ResponseDto<List<OrderResponseDto>>
                .SuccessResponse(result, "Orders for waiter retrieved successfully.");
        }

        public async Task<ResponseDto<List<WaiterDailySalesDto>>> GetAllWaitersDailySales()
        {
            var now = DateTime.UtcNow;

            var relevantShifts = await _context.Shifts
                .Include(s => s.User)
                .Where(s => s.StartTime.HasValue && s.EndTime == null) 
                .ToListAsync();

            if (relevantShifts.Count == 0)
            {
                return ResponseDto<List<WaiterDailySalesDto>>
                    .SuccessResponse(new List<WaiterDailySalesDto>(), "No waiters with active shifts for today.");
            }

            var waiterIds = relevantShifts.Select(s => s.UserId).Distinct().ToList();
            var waiterSales = new List<WaiterDailySalesDto>();

            foreach (var waiterId in waiterIds)
            {
                var waiterShifts = relevantShifts.Where(s => s.UserId == waiterId).ToList();
                
                if (!waiterShifts.Any()) continue;

                var firstShift = waiterShifts.First();
                if (firstShift.User == null || !firstShift.User.isActive) continue;

                var user = firstShift.User;

                var activeShift = waiterShifts.FirstOrDefault(s => s.EndTime == null);

                if (activeShift == null) continue;

                if (!activeShift.StartTime.HasValue) continue;

                decimal totalSales = 0;
                int totalOrders = 0;

                var endTimeFilter = now; 

                var orders = await _context.Orders
                    .Where(o => o.ShiftId == activeShift.Id 
                        && o.UserId == waiterId 
                        && o.CreatedAt >= activeShift.StartTime.Value 
                        && o.CreatedAt <= endTimeFilter) 
                    .ToListAsync();

                totalSales = orders.Sum(o => o.TotalAmount);
                totalOrders = orders.Count;

                if (totalOrders == 0) continue;

                waiterSales.Add(new WaiterDailySalesDto
                {
                    WaiterId = waiterId,
                    WaiterName = user.UserName ?? $"{user.FirstName} {user.LastName}".Trim() ?? "Unknown",
                    WaiterEmail = user.Email ?? "",
                    TotalSales = totalSales,
                    TotalOrders = totalOrders,
                    ActiveShiftId = activeShift.Id,
                    ShiftStartTime = activeShift.StartTime,
                    ShiftEndTime = now
                });
            }

            waiterSales = waiterSales
                .OrderByDescending(w => w.TotalSales)
                .ToList();

            _logger.LogInformation(
                "Daily sales for all waiters retrieved. Count: {Count}",
                waiterSales.Count
            );

            return ResponseDto<List<WaiterDailySalesDto>>
                .SuccessResponse(waiterSales, "Daily sales for all waiters retrieved successfully.");
        }

        private static OrderResponseDto MapToOrderResponse(Order order)
        {
            return new OrderResponseDto
            {
                OrderId = order.Id,
                OrderDate = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                Status = order.Status.ToString(),
                TotalAmount = order.TotalAmount,
                TableId = order.TableId,
                TableNumber = order.Table?.Number ?? 0,
                UserId = order.UserId,
                UserName = order.User?.UserName,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    DrinkId = oi.DrinkId,
                    DrinkName = oi.Drink.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            };
        }
    }
}
