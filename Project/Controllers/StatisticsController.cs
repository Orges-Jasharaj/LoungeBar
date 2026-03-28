using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.Data.Models;
using Project.Services.Interface;

namespace Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatistics _statisticsService;

        public StatisticsController(IStatistics statisticsService)
        {
            _statisticsService = statisticsService;
        }

        [HttpGet("overview")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GetOverview(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            return Ok(await _statisticsService.GetOverview(from, to));
        }

        [HttpGet("top-menu-items")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GetTopMenuItems(
            [FromQuery] int limit = 5,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            return Ok(await _statisticsService.GetTopMenuItems(limit, from, to));
        }
    }
}

