using Microsoft.EntityFrameworkCore;
using Project.Data;
using Project.Data.Enums;
using Project.Dtos.Responses;
using Project.Services.Interface;

namespace Project.Services.Implementation
{
    public class StatisticsService : IStatistics
    {
        private readonly AppDbContext _context;
        private readonly ILogger<StatisticsService> _logger;
        private readonly IOrder _orderService;
        private readonly IPayment _paymentService;
        private readonly IUser _userService;
        private readonly ITable _tableService;
        private readonly IReservation _reservationService;
        private readonly IShift _shiftService;

        public StatisticsService(
            AppDbContext context,
            ILogger<StatisticsService> logger,
            IOrder orderService,
            IPayment paymentService,
            IUser userService,
            ITable tableService,
            IReservation reservationService,
            IShift shiftService)
        {
            _context = context;
            _logger = logger;
            _orderService = orderService;
            _paymentService = paymentService;
            _userService = userService;
            _tableService = tableService;
            _reservationService = reservationService;
            _shiftService = shiftService;
        }

        public async Task<ResponseDto<StatisticsOverviewDto>> GetOverview(DateTime? from = null, DateTime? to = null)
        {
            try
            {
                // Total Users
                var usersRes = await _userService.GetAllUsersAsync(null);
                var totalUsers = usersRes.Success && usersRes.Data != null ? usersRes.Data.Count : 0;

                // Total Tables
                var tablesRes = await _tableService.GetAllTables();
                var totalTables = tablesRes.Success && tablesRes.Data != null ? tablesRes.Data.Count : 0;

                // Total Orders (with filters)
                var ordersCountRes = await _orderService.GetOrdersCount(from, to, null);
                var totalOrders = 0;
                if (ordersCountRes.Success && ordersCountRes.Data.HasValue)
                {
                    totalOrders = ordersCountRes.Data.Value;
                }

                // Revenue from Paid Orders
                var paidOrdersRes = await _orderService.GetOrders(1, int.MaxValue, from, to, "Paid");
                decimal revenuePaid = 0;
                int paidOrdersCount = 0;
                if (paidOrdersRes.Success && paidOrdersRes.Data != null && paidOrdersRes.Data.Items != null)
                {
                    revenuePaid = paidOrdersRes.Data.Items.Sum(o => o.TotalAmount);
                    paidOrdersCount = paidOrdersRes.Data.Items.Count;
                }

                // Average Order Value for Paid Orders
                decimal averageOrderValuePaid = paidOrdersCount > 0 ? revenuePaid / paidOrdersCount : 0;

                // Payments Count
                var paymentSummaryRes = await _paymentService.GetPaymentSummary(from, to);
                var paymentsCount = paymentSummaryRes.Success && paymentSummaryRes.Data != null 
                    ? paymentSummaryRes.Data.PaymentsCount 
                    : 0;

                // Reservations Count
                var reservationsRes = await _reservationService.GetAllReservations();
                var reservationsCount = reservationsRes.Success && reservationsRes.Data != null 
                    ? reservationsRes.Data.Count 
                    : 0;

                // Active Shifts
                var shiftsRes = await _shiftService.GetAllShifts();
                var activeShifts = shiftsRes.Success && shiftsRes.Data != null
                    ? shiftsRes.Data.Count(s => s.EndTime == null)
                    : 0;

                var overview = new StatisticsOverviewDto
                {
                    TotalUsers = totalUsers,
                    TotalTables = totalTables,
                    TotalOrders = totalOrders,
                    RevenuePaid = revenuePaid,
                    AverageOrderValuePaid = averageOrderValuePaid,
                    PaymentsCount = paymentsCount,
                    ReservationsCount = reservationsCount,
                    ActiveShifts = activeShifts
                };

                _logger.LogInformation(
                    "Statistics overview retrieved. From: {From}, To: {To}",
                    from,
                    to
                );

                return ResponseDto<StatisticsOverviewDto>.SuccessResponse(
                    overview,
                    "Statistics overview retrieved successfully."
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving statistics overview");
                return ResponseDto<StatisticsOverviewDto>.Failure("Error retrieving statistics overview.");
            }
        }

        public async Task<ResponseDto<List<TopDrinkDto>>> GetTopDrinks(int limit = 5, DateTime? from = null, DateTime? to = null)
        {
            try
            {
                var query = _context.OrderItems
                    .Include(oi => oi.Order)
                    .Include(oi => oi.Drink)
                    .AsQueryable();

                if (from.HasValue)
                {
                    query = query.Where(oi => oi.Order.CreatedAt >= from.Value);
                }

                if (to.HasValue)
                {
                    query = query.Where(oi => oi.Order.CreatedAt <= to.Value);
                }

                var topDrinks = await query
                    .GroupBy(oi => new { oi.DrinkId, oi.Drink.Name })
                    .Select(g => new TopDrinkDto
                    {
                        DrinkId = g.Key.DrinkId,
                        DrinkName = g.Key.Name,
                        Quantity = g.Sum(oi => oi.Quantity)
                    })
                    .OrderByDescending(d => d.Quantity)
                    .Take(limit)
                    .ToListAsync();

                _logger.LogInformation(
                    "Top {Limit} drinks retrieved. From: {From}, To: {To}",
                    limit,
                    from,
                    to
                );

                return ResponseDto<List<TopDrinkDto>>.SuccessResponse(
                    topDrinks,
                    "Top drinks retrieved successfully."
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top drinks");
                return ResponseDto<List<TopDrinkDto>>.Failure("Error retrieving top drinks.");
            }
        }
    }
}

