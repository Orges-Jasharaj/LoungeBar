using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Services.Interface;

namespace Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TableController : ControllerBase
    {
        private readonly ITable _tableService;
        private readonly ITableSessionService _tableSessionService;
        private readonly IQRCodeService _qrCodeService;

        public TableController(ITable tableService, ITableSessionService tableSessionService, IQRCodeService qrCodeService)
        {
            _tableService = tableService;
            _tableSessionService = tableSessionService;
            _qrCodeService = qrCodeService;
        }

        [HttpPost]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> CreateTable([FromBody] CreateTableDto createTableDto)
        {
            return Ok(await _tableService.CreateTable(createTableDto));
        }

        [HttpGet]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetAllTables()
        {
            return Ok(await _tableService.GetAllTables());
        }

        [HttpGet("{tableId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetTableById(int tableId)
        {
            return Ok(await _tableService.GetTableById(tableId));
        }

        [HttpGet("number/{tableNumber}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetTableByNumber(int tableNumber)
        {
            return Ok(await _tableService.GetTableByNumber(tableNumber));
        }

        [HttpGet("number/{tableNumber}/active-orders")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTableActiveOrders(int tableNumber)
        {
            return Ok(await _tableService.GetTableActiveOrders(tableNumber));
        }

        [HttpPost("session/{tableNumber}")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateTableSession(int tableNumber)
        {
            return Ok(await _tableSessionService.CreateTableSession(tableNumber));
        }

        [HttpGet("session/{sessionGuid}/table-{tableNumber}/active-orders")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTableActiveOrdersBySession(Guid sessionGuid, int tableNumber)
        {
            return Ok(await _tableSessionService.GetTableActiveOrdersBySession(sessionGuid, tableNumber));
        }

        [HttpGet("session/{sessionGuid}/active-orders")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTableActiveOrdersBySessionGuid(Guid sessionGuid)
        {
            return Ok(await _tableSessionService.GetTableActiveOrdersBySessionGuid(sessionGuid));
        }

        [HttpPut("number/{tableNumber}/hide-order")]
        [AllowAnonymous]
        public async Task<IActionResult> HideTableLatestOrder(int tableNumber)
        {
            return Ok(await _tableService.HideTableLatestOrder(tableNumber));
        }

        [HttpPut("{tableId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> UpdateTable(int tableId, [FromBody] CreateTableDto updateTableDto)
        {
            return Ok(await _tableService.UpdateTable(tableId, updateTableDto));
        }

        [HttpDelete("{tableId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> DeleteTable(int tableId)
        {
            return Ok(await _tableService.DeleteTable(tableId));
        }

        [HttpPost("{tableId}/generate-qrcode")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GenerateQRCodeForTable(int tableId, [FromQuery] string? baseUrl = null)
        {
            var table = await _tableService.GetTableById(tableId);
            if (!table.Success || table.Data == null)
            {
                return BadRequest(table);
            }

            var result = await _qrCodeService.GenerateAndSaveQRCodeForTable(table.Data.Number, baseUrl);
            return Ok(result);
        }

        [HttpGet("number/{tableNumber}/qrcode")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GetQRCodeForTable(int tableNumber)
        {
            var table = await _tableService.GetTableByNumber(tableNumber);
            if (!table.Success || table.Data == null)
            {
                return NotFound(table);
            }

            if (table.Data.QRCodeImage == null || table.Data.QRCodeImage.Length == 0)
            {
                var generateResult = await _qrCodeService.GenerateAndSaveQRCodeForTable(tableNumber, null);
                if (!generateResult.Success)
                {
                    return BadRequest(generateResult);
                }
                return File(generateResult.Data, "image/png");
            }

            return File(table.Data.QRCodeImage, "image/png");
        }
    }
}

