using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Project.Data.Enums;
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
        private readonly IPdfService _pdfService;

        public OrderController(IOrder orderService, IPdfService pdfService)
        {
            _orderService = orderService;
            _pdfService = pdfService;
        }

        [HttpGet("GetMyOrders")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            return Ok(await _orderService.GetMyOrders());
        }

        [HttpGet("station")]
        [Authorize(Roles = $"{RoleTypes.Cooker},{RoleTypes.Bartender},{RoleTypes.Admin},{RoleTypes.SuperAdmin}")]
        public async Task<IActionResult> GetOrdersForStation([FromQuery] string itemType)
        {
            if (!Enum.TryParse<ItemType>(itemType, true, out var type))
            {
                return BadRequest(new { message = "Invalid itemType. Use Food or Drink." });
            }

            if (User.IsInRole(RoleTypes.Cooker) && type != ItemType.Food)
            {
                return Forbid();
            }

            if (User.IsInRole(RoleTypes.Bartender) && type != ItemType.Drink)
            {
                return Forbid();
            }

            return Ok(await _orderService.GetOrdersForStation(type));
        }

        [HttpGet("GetAllOrders")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetAllOrders()
        {
            return Ok(await _orderService.GetAllOrders());
        }

        [HttpGet]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetOrders(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] string? status = null)
        {
            return Ok(await _orderService.GetOrders(page, pageSize, from, to, status));
        }

        [HttpGet("count")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetOrdersCount(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] string? status = null)
        {
            return Ok(await _orderService.GetOrdersCount(from, to, status));
        }

        [HttpGet("table/{tableId}")]
        [Authorize]
        public async Task<IActionResult> GetOrdersByTable(
            int tableId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            return Ok(await _orderService.GetOrdersByTable(tableId, page, pageSize));
        }

        [HttpGet("{orderId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            return Ok(await _orderService.GetOrderById(orderId));
        }

        [HttpGet("{orderId}/invoice")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee},{RoleTypes.User}")]
        public async Task<IActionResult> GetOrderInvoice(int orderId)
        {
            var orderResponse = await _orderService.GetOrderById(orderId);
            
            if (!orderResponse.Success || orderResponse.Data == null)
            {
                return NotFound(new { message = orderResponse.Message ?? "Order not found." });
            }

            var pdfBytes = _pdfService.GenerateInvoicePdf(orderResponse.Data);
            
            return File(pdfBytes, "application/pdf", $"Invoice_{orderId}.pdf");
        }

        [HttpPost]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee}")]
        public async Task<IActionResult> CreateOrder(
            [FromBody] CreateOrderRequestDto createOrderDto)
        {
            return Ok(await _orderService.CreateOrder(createOrderDto));
        }

        [HttpPut("{orderId}/status")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.Employee},{RoleTypes.Cooker},{RoleTypes.Bartender}")]
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

        [HttpGet("waiter/{waiterId}/total")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GetTotalOrdersByWaiterId(string waiterId)
        {
            return Ok(await _orderService.GetTotalOrdersByWaiterId(waiterId));
        }

        [HttpGet("waiter/{waiterId}/orders")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GetOrdersByWaiterId(
            string waiterId,
            [FromQuery] int? shiftId = null)
        {
            return Ok(await _orderService.GetOrdersByWaiterId(waiterId, shiftId));
        }

        [HttpGet("waiters/daily-sales")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin}")]
        public async Task<IActionResult> GetAllWaitersDailySales()
        {
            return Ok(await _orderService.GetAllWaitersDailySales());
        }
    }
}
