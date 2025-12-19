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
    public class CategoryController : ControllerBase
    {
        private readonly ICategory _categoryService;

        public CategoryController(ICategory categoryService)
        {
            _categoryService = categoryService;
        }
        
        [HttpPost("create")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto createCategoryDto)
        {
            return Ok(await _categoryService.CreateCategory(createCategoryDto));
        }

        [HttpDelete("delete/{categoryId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> DeleteCategory(int categoryId)
        {
            return Ok(await _categoryService.DeleteCategory(categoryId));
        }

        [HttpGet("all")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin},{RoleTypes.User}")]
        public async Task<IActionResult> GetAllCategories()
        {
            return Ok(await _categoryService.GetAllCategories());
        }

        [HttpGet("{categoryId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> GetCategoryById(int categoryId)
        {
            return Ok(await _categoryService.GetCategoryById(categoryId));
        }

        [HttpPut("update/{categoryId}")]
        [Authorize(Roles = $"{RoleTypes.SuperAdmin},{RoleTypes.Admin}")]
        public async Task<IActionResult> UpdateCategory(int categoryId, [FromBody] CreateCategoryDto updateCategoryDto)
        {
            return Ok(await _categoryService.UpdateCategory(categoryId, updateCategoryDto));
        }
    }
}
