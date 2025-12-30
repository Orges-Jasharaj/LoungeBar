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
    public class ShiftController : ControllerBase
    {
        private readonly IShift _shiftService;

        public ShiftController(IShift shiftService)
        {
            _shiftService = shiftService;
        }

        [HttpPost("create")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> CreateShift([FromBody] CreateShiftDto createShiftDto)
        {
            return Ok(await _shiftService.CreateShift(createShiftDto));
        }

        [HttpDelete("delete/{shiftId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> DeleteShift(int shiftId)
        {
            return Ok(await _shiftService.DeleteShift(shiftId));
        }

        [HttpGet("all")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GetAllShifts()
        {
            return Ok(await _shiftService.GetAllShifts());
        }

        [HttpGet("{shiftId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GetShiftById(int shiftId)
        {
            return Ok(await _shiftService.GetShiftById(shiftId));
        }

        [HttpGet("myshift")]
        [Authorize]
        public async Task<IActionResult> GetMyShift()
        {
            return Ok(await _shiftService.GetMyShift());
        }

        [HttpPut("update/{shiftId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> UpdateShift(int shiftId, [FromBody] CreateShiftDto updateShiftDto)
        {
            return Ok(await _shiftService.UpdateShift(shiftId, updateShiftDto));
        }

        [HttpPost("start")]
        [Authorize]
        public async Task<IActionResult> Start()
        {
            return Ok(await _shiftService.Start());
        }

        [HttpPost("stop")]
        [Authorize]
        public async Task<IActionResult> Stop()
        {
            return Ok(await _shiftService.Stop());
        }
    }
}
