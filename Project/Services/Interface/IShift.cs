using Project.Dtos.Requests;
using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IShift
    {
        Task<ResponseDto<bool>> CreateShift(CreateShiftDto createShiftDto);
        Task<ResponseDto<List<ShiftDto>>> GetAllShifts();
        Task<ResponseDto<ShiftDto>> GetShiftById(int shiftId);
        Task<ResponseDto<bool>> Start();
        Task<ResponseDto<bool>> Stop();
        Task<ResponseDto<bool>> DeleteShift(int shiftId);
        Task<ResponseDto<ShiftDto>> GetMyShift();
        Task<ResponseDto<bool>> UpdateShift(int shiftId, CreateShiftDto updateShiftDto);
    }
}
