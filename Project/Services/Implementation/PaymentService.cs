using Microsoft.EntityFrameworkCore;
using Project.Data;
using Project.Data.Enums;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Dtos.Responses;
using Project.Services.Interface;

namespace Project.Services.Implementation
{
    public class PaymentService : IPayment
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PaymentService> _logger;
        private readonly CurrentUserService _currentUserService;

        public PaymentService(
            AppDbContext context,
            ILogger<PaymentService> logger,
            CurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<ResponseDto<bool>> CreatePayment(CreatePaymentDto createPaymentDto)
        {
            var userId = _currentUserService.GetCurrentUserId();

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == createPaymentDto.OrderId);

            if (order == null)
                return ResponseDto<bool>.Failure("Order not found.");

            if (order.Status != OrderStatus.Served)
                return ResponseDto<bool>.Failure("Order must be served before payment.");

            var existsPayment = await _context.Payments
                .AnyAsync(p => p.OrderId == order.Id);

            if (existsPayment)
                return ResponseDto<bool>.Failure("Payment already exists for this order.");

            if (!Enum.TryParse<PaymentMethod>(
                createPaymentDto.Method, true, out var method))
            {
                return ResponseDto<bool>.Failure("Invalid payment method.");
            }

            var payment = new Payment
            {
                OrderId = order.Id,
                Amount = order.TotalAmount,
                Method = method,
                Status = PaymentStatus.Completed,
                PaymentDate = DateTime.UtcNow,
                CreatedBy = userId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            order.Status = OrderStatus.Paid;

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Payment created for Order {OrderId} by {UserId}, Amount: {Amount}",
                order.Id,
                userId,
                payment.Amount
            );

            return ResponseDto<bool>.SuccessResponse(true, "Payment completed successfully.");
        }

        public async Task<ResponseDto<List<PaymentResponseDto>>> GetAllPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Order)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            var result = payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.Id,
                OrderId = p.OrderId,
                Amount = p.Amount,
                Method = p.Method.ToString(),
                Status = p.Status.ToString(),
                PaymentDate = p.PaymentDate,
                CreatedBy = p.CreatedBy
            }).ToList();

            return ResponseDto<List<PaymentResponseDto>>
                .SuccessResponse(result, "Payments retrieved successfully.");
        }

        public async Task<ResponseDto<List<PaymentResponseDto>>> GetPaymentsByOrder(int orderId)
        {
            var payments = await _context.Payments
                .Where(p => p.OrderId == orderId)
                .ToListAsync();

            var result = payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.Id,
                OrderId = p.OrderId,
                Amount = p.Amount,
                Method = p.Method.ToString(),
                Status = p.Status.ToString(),
                PaymentDate = p.PaymentDate,
                CreatedBy = p.CreatedBy
            }).ToList();

            return ResponseDto<List<PaymentResponseDto>>
                .SuccessResponse(result, "Payments retrieved successfully.");
        }

        public async Task<ResponseDto<PaymentSummaryDto>> GetPaymentSummary(DateTime? from = null, DateTime? to = null)
        {
            var query = _context.Payments.AsQueryable();

            if (from.HasValue)
            {
                query = query.Where(p => p.PaymentDate >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(p => p.PaymentDate <= to.Value);
            }

            var totalRevenue = await query.SumAsync(p => p.Amount);
            var paymentsCount = await query.CountAsync();

            var summary = new PaymentSummaryDto
            {
                TotalRevenue = totalRevenue,
                PaymentsCount = paymentsCount
            };

            _logger.LogInformation(
                "Payment summary retrieved. Total Revenue: {TotalRevenue}, Count: {Count}",
                totalRevenue,
                paymentsCount
            );

            return ResponseDto<PaymentSummaryDto>.SuccessResponse(
                summary,
                "Payment summary retrieved successfully."
            );
        }

        public async Task<ResponseDto<PagedResponseDto<PaymentResponseDto>>> GetPayments(int page = 1, int pageSize = 10, DateTime? from = null, DateTime? to = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.Payments
                .Include(p => p.Order)
                .AsQueryable();

            if (from.HasValue)
            {
                query = query.Where(p => p.PaymentDate >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(p => p.PaymentDate <= to.Value);
            }

            var totalCount = await query.CountAsync();

            var payments = await query
                .OrderByDescending(p => p.PaymentDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.Id,
                OrderId = p.OrderId,
                Amount = p.Amount,
                Method = p.Method.ToString(),
                Status = p.Status.ToString(),
                PaymentDate = p.PaymentDate,
                CreatedBy = p.CreatedBy
            }).ToList();

            var pagedResponse = new PagedResponseDto<PaymentResponseDto>
            {
                Items = result,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            _logger.LogInformation(
                "Payments retrieved with filters. Page: {Page}, PageSize: {PageSize}, Total: {TotalCount}",
                page,
                pageSize,
                totalCount
            );

            return ResponseDto<PagedResponseDto<PaymentResponseDto>>.SuccessResponse(
                pagedResponse,
                "Payments retrieved successfully."
            );
        }
    }
}
