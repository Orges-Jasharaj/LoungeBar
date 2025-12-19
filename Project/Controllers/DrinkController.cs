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
    public class DrinkController : ControllerBase
    {
        private readonly IDrink _drinkService;

        public DrinkController(IDrink drinkService)
        {
            _drinkService = drinkService;
        }

        [HttpGet]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> GetAllDrinks()
        {
            return Ok(await _drinkService.GetAllDrinks());
        }

        [HttpGet("{drinkId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> GetDrinkById(int drinkId)
        {
            return Ok(await _drinkService.GetDrinkById(drinkId));
        }

        [HttpPost]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> CreateDrink([FromBody] CreateDrinkDto createDrinkDto)
        {
            return Ok(await _drinkService.CreateDrink(createDrinkDto));
        }

        [HttpPut("{drinkId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> UpdateDrink(int drinkId, [FromBody] CreateDrinkDto updateDrinkDto)
        {
            return Ok(await _drinkService.UpdateDrink(drinkId, updateDrinkDto));
        }

        [HttpDelete("{drinkId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> DeleteDrink(int drinkId)
        {
            return Ok(await _drinkService.DeleteDrink(drinkId));
        }

    }
}
