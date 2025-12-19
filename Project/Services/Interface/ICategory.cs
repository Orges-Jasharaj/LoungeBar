using Project.Dtos.Requests;
using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface ICategory
    {
        Task<ResponseDto<bool>> CreateCategory(CreateCategoryDto createCategoryDto);
        Task<ResponseDto<List<CategoryDto>>> GetAllCategories();
        Task<ResponseDto<CategoryDto>> GetCategoryByName(string name);
        Task<ResponseDto<CategoryDto>> GetCategoryById(int categoryId);
        Task<ResponseDto<bool>> UpdateCategory(int categoryId, CreateCategoryDto updateCategoryDto);
        Task<ResponseDto<bool>> DeleteCategory(int categoryId);
    }
}
