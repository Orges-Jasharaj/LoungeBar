using Project.Dtos.Requests;
using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IReservation
    {
        Task<ResponseDto<bool>> CreateReservation(CreateReservationDto createReservationDto);
        Task<ResponseDto<List<ReservationDto>>> GetAllReservations();
        Task<ResponseDto<ReservationDto>> GetReservationById(int reservationId);
        Task<ResponseDto<List<ReservationDto>>> GetReservationsByTable(int tableNumber);
        Task<ResponseDto<List<ReservationDto>>> GetReservationsByDate(DateTime date);
        Task<ResponseDto<bool>> UpdateReservation(int reservationId, CreateReservationDto updateReservationDto);
        Task<ResponseDto<bool>> UpdateReservationStatus(int reservationId, string status);
        Task<ResponseDto<bool>> CancelReservation(int reservationId);
        Task<ResponseDto<bool>> DeleteReservation(int reservationId);
    }
}

