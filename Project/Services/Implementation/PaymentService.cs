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
    }
}
