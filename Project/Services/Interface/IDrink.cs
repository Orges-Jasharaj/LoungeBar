using Project.Dtos.Requests;
using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IDrink
    {
        Task<ResponseDto<bool>> CreateDrink(CreateDrinkDto createDrinkDto);
        Task<ResponseDto<List<DrinkDto>>> GetAllDrinks();
        Task<ResponseDto<DrinkDto>> GetDrinkById(int drinkId);
        Task<ResponseDto<bool>> UpdateDrink(int drinkId, CreateDrinkDto updateDrinkDto);
        Task<ResponseDto<bool>> DeleteDrink(int drinkId);
    }
}
