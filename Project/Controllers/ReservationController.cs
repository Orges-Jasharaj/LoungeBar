using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Services.Interface;

namespace Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly IReservation _reservationService;

        public ReservationController(IReservation reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpPost]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto createReservationDto)
        {
            return Ok(await _reservationService.CreateReservation(createReservationDto));
        }

        [HttpGet]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GetAllReservations()
        {
            return Ok(await _reservationService.GetAllReservations());
        }

        [HttpGet("{reservationId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> GetReservationById(int reservationId)
        {
            return Ok(await _reservationService.GetReservationById(reservationId));
        }

        [HttpGet("table/{tableNumber}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> GetReservationsByTable(int tableNumber)
        {
            return Ok(await _reservationService.GetReservationsByTable(tableNumber));
        }

        [HttpGet("date/{date}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> GetReservationsByDate(DateTime date)
        {
            return Ok(await _reservationService.GetReservationsByDate(date));
        }

        [HttpPut("{reservationId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> UpdateReservation(int reservationId, [FromBody] CreateReservationDto updateReservationDto)
        {
            return Ok(await _reservationService.UpdateReservation(reservationId, updateReservationDto));
        }

        [HttpPut("{reservationId}/status")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> UpdateReservationStatus(int reservationId, [FromQuery] string status)
        {
            return Ok(await _reservationService.UpdateReservationStatus(reservationId, status));
        }

        [HttpPut("{reservationId}/cancel")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> CancelReservation(int reservationId)
        {
            return Ok(await _reservationService.CancelReservation(reservationId));
        }

        [HttpDelete("{reservationId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> DeleteReservation(int reservationId)
        {
            return Ok(await _reservationService.DeleteReservation(reservationId));
        }
    }
}

