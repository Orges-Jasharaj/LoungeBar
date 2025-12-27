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

        public TableController(ITable tableService)
        {
            _tableService = tableService;
        }

        [HttpPost]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> CreateTable([FromBody] CreateTableDto createTableDto)
        {
            return Ok(await _tableService.CreateTable(createTableDto));
        }

        [HttpGet]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> GetAllTables()
        {
            return Ok(await _tableService.GetAllTables());
        }

        [HttpGet("{tableId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> GetTableById(int tableId)
        {
            return Ok(await _tableService.GetTableById(tableId));
        }

        [HttpGet("number/{tableNumber}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
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
    }
}

