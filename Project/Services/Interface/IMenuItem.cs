using Project.Dtos.Requests;
using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IMenuItem
    {
        Task<ResponseDto<bool>> CreateMenuItem(CreateMenuItemDto dto);
        Task<ResponseDto<List<MenuItemDto>>> GetAllMenuItems();
        Task<ResponseDto<MenuItemDto>> GetMenuItemById(int id);
        Task<ResponseDto<bool>> UpdateMenuItem(int id, CreateMenuItemDto dto);
        Task<ResponseDto<bool>> DeleteMenuItem(int id);
    }
}
