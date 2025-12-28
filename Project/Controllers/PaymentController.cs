using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Services.Interface;

namespace Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPayment _paymentService;

        public PaymentController(IPayment paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> CreatePayment(
            [FromBody] CreatePaymentDto createPaymentDto)
        {
            return Ok(await _paymentService.CreatePayment(createPaymentDto));
        }

        [HttpGet]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> GetAllPayments()
        {
            return Ok(await _paymentService.GetAllPayments());
        }

        [HttpGet("order/{orderId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GetPaymentsByOrder(int orderId)
        {
            return Ok(await _paymentService.GetPaymentsByOrder(orderId));
        }
    }
}
