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
    public class OrderController : ControllerBase
    {
        private readonly IOrder _orderService;

        public OrderController(IOrder orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("GetMyOrders")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            return Ok(await _orderService.GetMyOrders());
        }

        [HttpGet("GetAllOrders")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetAllOrders()
        {
            return Ok(await _orderService.GetAllOrders());
        }

        [HttpGet("{orderId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            return Ok(await _orderService.GetOrderById(orderId));
        }

        [HttpPost]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee}")]
        public async Task<IActionResult> CreateOrder(
            [FromBody] CreateOrderRequestDto createOrderDto)
        {
            return Ok(await _orderService.CreateOrder(createOrderDto));
        }

        [HttpPut("{orderId}/status")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee}")]
        public async Task<IActionResult> UpdateOrderStatus(
            int orderId,
            [FromQuery] string status)
        {
            return Ok(await _orderService.UpdateOrderStatus(orderId, status));
        }

        [HttpPut("{orderId}/hide")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User},{RoleTypes.Employee}")]
        public async Task<IActionResult> HideOrderFromCustomers(int orderId)
        {
            return Ok(await _orderService.HideOrderFromCustomers(orderId));
        }

        [HttpDelete("{orderId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User},{RoleTypes.Employee}")]
        public async Task<IActionResult> DeleteOrder(int orderId)
        {
            return Ok(await _orderService.DeleteOrder(orderId));
        }

        [HttpGet("shift/{shiftId}/total")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetTotalOrdersByShift(int shiftId)
        {
            return Ok(await _orderService.GetTotalOrdersByShift(shiftId));
        }

        [HttpGet("myshift/total")]
        [Authorize]
        public async Task<IActionResult> GetTotalOrdersByMyCurrentShift()
        {
            return Ok(await _orderService.GetTotalOrdersByMyCurrentShift());
        }
    }
}
