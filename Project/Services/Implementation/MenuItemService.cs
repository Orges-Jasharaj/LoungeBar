using Microsoft.EntityFrameworkCore;
using Project.Data;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Dtos.Responses;
using Project.Services.Interface;

namespace Project.Services.Implementation
{
    public class MenuItemService : IMenuItem
    {
        private readonly AppDbContext _context;
        private readonly ILogger<MenuItemService> _logger;
        private readonly CurrentUserService _currentUserService;

        public MenuItemService(AppDbContext context, ILogger<MenuItemService> logger, CurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<ResponseDto<bool>> CreateMenuItem(CreateMenuItemDto createDto)
        {
            var existing = _context.MenuItems.FirstOrDefault(d => d.Name.ToLower() == createDto.Name.ToLower());
            if (existing != null)
            {
                return ResponseDto<bool>.Failure("An item with the same name already exists.");
            }
            var userId = _currentUserService.GetCurrentUserId();

            var item = new MenuItem
            {
                Name = createDto.Name,
                Price = createDto.Price,
                CategoryId = createDto.CategoryId,
                ItemType = createDto.ItemType,
                IsAlcoholic = createDto.IsAlcoholic,
                AlcoholPercentage = createDto.AlcoholPercentage,
                ImageUrl = createDto.ImageUrl,
                IsAvailable = createDto.IsAvailable,
                CreatedBy = userId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            _context.MenuItems.Add(item);
            await _context.SaveChangesAsync();

            _logger.LogInformation("MenuItem {Name} created by {UserId}", item.Name, userId);

            return ResponseDto<bool>.SuccessResponse(true, "Menu item created successfully.");
        }

        public async Task<ResponseDto<bool>> DeleteMenuItem(int id)
        {
            var item = _context.MenuItems.FirstOrDefault(d => d.Id == id);

            if (item == null)
            {
                return ResponseDto<bool>.Failure("Menu item not found.");
            }

            _context.MenuItems.Remove(item);
            await _context.SaveChangesAsync();
            _logger.LogInformation("MenuItem {Id} deleted by {UserId}", id, _currentUserService.GetCurrentUserId());
            return ResponseDto<bool>.SuccessResponse(true, "Menu item deleted successfully.");
        }

        public async Task<ResponseDto<List<MenuItemDto>>> GetAllMenuItems()
        {
            var items = await _context.MenuItems
                .Include(d => d.Category)
                .Select(d => new MenuItemDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Price = d.Price,
                    CategoryId = d.CategoryId,
                    CategoryName = d.Category.Name,
                    ItemType = d.ItemType,
                    IsAlcoholic = d.IsAlcoholic,
                    AlcoholPercentage = d.AlcoholPercentage,
                    ImageUrl = d.ImageUrl,
                    IsAvailable = d.IsAvailable,
                    CreatedBy = d.CreatedBy,
                    CreatedAt = d.CreatedAt,
                    UpdatedBy = d.UpdatedBy,
                    UpdatedAt = d.UpdatedAt
                })
                .ToListAsync();

            return ResponseDto<List<MenuItemDto>>.SuccessResponse(items, "Menu items retrieved successfully.");
        }


        public async Task<ResponseDto<MenuItemDto>> GetMenuItemById(int id)
        {
            var item = await _context.MenuItems
                .Include(d => d.Category)
                .Where(d => d.Id == id)
                .Select(d => new MenuItemDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Price = d.Price,
                    CategoryId = d.CategoryId,
                    CategoryName = d.Category.Name,
                    ItemType = d.ItemType,
                    IsAlcoholic = d.IsAlcoholic,
                    AlcoholPercentage = d.AlcoholPercentage,
                    ImageUrl = d.ImageUrl,
                    IsAvailable = d.IsAvailable,
                    CreatedBy = d.CreatedBy,
                    CreatedAt = d.CreatedAt,
                    UpdatedBy = d.UpdatedBy,
                    UpdatedAt = d.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (item == null)
            {
                return ResponseDto<MenuItemDto>.Failure("Menu item not found.");
            }
            return ResponseDto<MenuItemDto>.SuccessResponse(item, "Menu item retrieved successfully.");

        }

        public async Task<ResponseDto<bool>> UpdateMenuItem(int id, CreateMenuItemDto updateDto)
        {
            var item = _context.MenuItems.FirstOrDefault(d => d.Id == id);
            if (item == null)
            {
                return ResponseDto<bool>.Failure("Menu item not found.");
            }
            item.Name = updateDto.Name;
            item.Price = updateDto.Price;
            item.CategoryId = updateDto.CategoryId;
            item.ItemType = updateDto.ItemType;
            item.IsAlcoholic = updateDto.IsAlcoholic;
            item.AlcoholPercentage = updateDto.AlcoholPercentage;
            item.ImageUrl = updateDto.ImageUrl;
            item.IsAvailable = updateDto.IsAvailable;
            item.UpdatedBy = _currentUserService.GetCurrentUserId() ?? "System";
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _logger.LogInformation("MenuItem {Id} updated by {UserId}", id, _currentUserService.GetCurrentUserId());
            return ResponseDto<bool>.SuccessResponse(true, "Menu item updated successfully.");
        }
    }
}
