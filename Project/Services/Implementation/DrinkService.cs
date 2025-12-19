using Microsoft.EntityFrameworkCore;
using Project.Data;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Dtos.Responses;
using Project.Services.Interface;

namespace Project.Services.Implementation
{
    public class DrinkService : IDrink
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DrinkService> _logger;
        private readonly CurrentUserService _currentUserService;

        public DrinkService(AppDbContext context, ILogger<DrinkService> logger, CurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<ResponseDto<bool>> CreateDrink(CreateDrinkDto createDrinkDto)
        {
            var exisitingDrink = _context.Drinks.FirstOrDefault(d => d.Name.ToLower() == createDrinkDto.Name.ToLower());
            if (exisitingDrink != null)
            {
                return ResponseDto<bool>.Failure("A drink with the same name already exists.");
            }
            var userId = _currentUserService.GetCurrentUserId();

            var drink = new Drink
            {
                Name = createDrinkDto.Name,
                Price = createDrinkDto.Price,
                CategoryId = createDrinkDto.CategoryId,
                IsAlcoholic = createDrinkDto.IsAlcoholic,
                AlcoholPercentage = createDrinkDto.AlcoholPercentage,
                ImageUrl = createDrinkDto.ImageUrl,
                IsAvailable = createDrinkDto.IsAvailable,
                CreatedBy = userId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            _context.Drinks.Add(drink);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Drink {DrinkName} created by {UserId}", drink.Name, userId);

            return ResponseDto<bool>.SuccessResponse(true, "Drink created successfully.");
        }

        public async Task<ResponseDto<bool>> DeleteDrink(int drinkId)
        {
            var drink = _context.Drinks.FirstOrDefault(d => d.Id == drinkId);

            if (drink == null)
            {
                return ResponseDto<bool>.Failure("Drink not found.");
            }

            _context.Drinks.Remove(drink);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Drink {DrinkId} deleted by {UserId}", drinkId, _currentUserService.GetCurrentUserId());
            return ResponseDto<bool>.SuccessResponse(true, "Drink deleted successfully.");
        }

        public async Task<ResponseDto<List<DrinkDto>>> GetAllDrinks()
        {
            var drinks = await _context.Drinks
                .Include(d => d.Category)
                .Select(d => new DrinkDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Price = d.Price,
                    CategoryId = d.CategoryId,
                    CategoryName = d.Category.Name,   
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

            return ResponseDto<List<DrinkDto>>.SuccessResponse(drinks, "Drinks retrieved successfully.");
        }


        public async Task<ResponseDto<DrinkDto>> GetDrinkById(int drinkId)
        {
            var drink = await _context.Drinks
                .Include(d => d.Category)
                .Where(d => d.Id == drinkId)
                .Select(d => new DrinkDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Price = d.Price,
                    CategoryId = d.CategoryId,
                    CategoryName = d.Category.Name,
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

            if (drink == null)
            {
                return ResponseDto<DrinkDto>.Failure("Drink not found.");
            }
            return ResponseDto<DrinkDto>.SuccessResponse(drink, "Drink retrieved successfully.");

        }

        public async Task<ResponseDto<bool>> UpdateDrink(int drinkId, CreateDrinkDto updateDrinkDto)
        {
            var drink = _context.Drinks.FirstOrDefault(d => d.Id == drinkId);
            if (drink == null)
            {
                return ResponseDto<bool>.Failure("Drink not found.");
            }
            drink.Name = updateDrinkDto.Name;
            drink.Price = updateDrinkDto.Price;
            drink.CategoryId = updateDrinkDto.CategoryId;
            drink.IsAlcoholic = updateDrinkDto.IsAlcoholic;
            drink.AlcoholPercentage = updateDrinkDto.AlcoholPercentage;
            drink.ImageUrl = updateDrinkDto.ImageUrl;
            drink.IsAvailable = updateDrinkDto.IsAvailable;
            drink.UpdatedBy = _currentUserService.GetCurrentUserId() ?? "System";
            drink.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Drink {DrinkId} updated by {UserId}", drinkId, _currentUserService.GetCurrentUserId());
            return ResponseDto<bool>.SuccessResponse(true, "Drink updated successfully.");
        }
    }
}
