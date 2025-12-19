using Microsoft.EntityFrameworkCore;
using Project.Data;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Dtos.Responses;
using Project.Services.Interface;

namespace Project.Services.Implementation
{
    public class CategoryService : ICategory
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CategoryService> _logger;
        private readonly CurrentUserService _currentUserService;

        public CategoryService(AppDbContext context, ILogger<CategoryService> logger, CurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<ResponseDto<bool>> CreateCategory(CreateCategoryDto createCategoryDto)
        {
            var categoryExists = _context.Categories.Any(c => c.Name.ToLower() == createCategoryDto.Name.ToLower());

            if (categoryExists)
            {
                return ResponseDto<bool>.Failure("Category with the same name already exists.");
            }

            var userid = _currentUserService.GetCurrentUserId();

            var category = new Category
            {
                Name = createCategoryDto.Name,
                CreatedBy = userid ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Category {CategoryName} created by {UserId}", category.Name, userid);

            return ResponseDto<bool>.SuccessResponse(true, "Category created successfully.");
        }

        public async Task<ResponseDto<bool>> DeleteCategory(int categoryId)
        {
            var category = await _context.Categories.FindAsync(categoryId);
            if (category == null)
            {
                return ResponseDto<bool>.Failure("Category not found.");
            }
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Category {CategoryId} deleted by {UserId}", categoryId, _currentUserService.GetCurrentUserId());
            return ResponseDto<bool>.SuccessResponse(true, "Category deleted successfully.");
        }

        public async Task<ResponseDto<List<CategoryDto>>> GetAllCategories()
        {
            var categories = _context.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Drinks = c.Drinks,
                    CreatedAt = c.CreatedAt,
                    CreatedBy = c.CreatedBy,
                    UpdatedAt = c.UpdatedAt,
                    UpdatedBy = c.UpdatedBy
                })
                .ToList();
            return ResponseDto<List<CategoryDto>>.SuccessResponse(categories, "Categories retrieved successfully.");
        }

        public async Task<ResponseDto<CategoryDto>> GetCategoryById(int categoryId)
        {
            var category = await _context.Categories
                .Where(c => c.Id == categoryId)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Drinks = c.Drinks,
                    CreatedAt = c.CreatedAt,
                    CreatedBy = c.CreatedBy,
                    UpdatedAt = c.UpdatedAt,
                    UpdatedBy = c.UpdatedBy 

                })
                .FirstOrDefaultAsync();
            if (category == null)
            {
                return ResponseDto<CategoryDto>.Failure("Category not found.");
            }
            
            return ResponseDto<CategoryDto>.SuccessResponse(category, "Category retrieved successfully.");
        }

        public async Task<ResponseDto<bool>> UpdateCategory(int categoryId, CreateCategoryDto updateCategoryDto)
        {
            var category = await _context.Categories.FindAsync(categoryId);
            if (category == null)
            {
                return ResponseDto<bool>.Failure("Category not found.");
            }
            category.Name = updateCategoryDto.Name;
            category.UpdatedBy = _currentUserService.GetCurrentUserId() ?? "System";
            category.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Category {CategoryId} updated by {UserId}", categoryId, _currentUserService.GetCurrentUserId());
            return ResponseDto<bool>.SuccessResponse(true, "Category updated successfully.");
        }
    }
}
