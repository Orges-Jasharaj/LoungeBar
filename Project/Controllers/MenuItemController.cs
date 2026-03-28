using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Services.Interface;

namespace Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuItemController : ControllerBase
    {
        private readonly IMenuItem _menuItemService;

        public MenuItemController(IMenuItem menuItemService)
        {
            _menuItemService = menuItemService;
        }

        [HttpGet]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _menuItemService.GetAllMenuItems());
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User},{RoleTypes.Employee}")]
        public async Task<IActionResult> GetById(int id)
        {
            return Ok(await _menuItemService.GetMenuItemById(id));
        }

        [HttpPost]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> Create([FromBody] CreateMenuItemDto dto)
        {
            return Ok(await _menuItemService.CreateMenuItem(dto));
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateMenuItemDto dto)
        {
            return Ok(await _menuItemService.UpdateMenuItem(id, dto));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> Delete(int id)
        {
            return Ok(await _menuItemService.DeleteMenuItem(id));
        }
    }
}
