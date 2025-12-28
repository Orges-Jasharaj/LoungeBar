using Microsoft.EntityFrameworkCore;
using Project.Data;
using Project.Data.Enums;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Dtos.Responses;
using Project.Services.Interface;

namespace Project.Services.Implementation
{
    public class ReservationService : IReservation
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ReservationService> _logger;
        private readonly CurrentUserService _currentUserService;

        public ReservationService(
            AppDbContext context,
            ILogger<ReservationService> logger,
            CurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<ResponseDto<bool>> CreateReservation(CreateReservationDto createReservationDto)
        {
            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Number == createReservationDto.TableNumber);

            if (table == null)
            {
                return ResponseDto<bool>.Failure($"Table with number {createReservationDto.TableNumber} not found.");
            }

            if (createReservationDto.NumberOfGuests > table.Capacity)
            {
                return ResponseDto<bool>.Failure($"Table {createReservationDto.TableNumber} can only accommodate {table.Capacity} guests, but {createReservationDto.NumberOfGuests} guests requested.");
            }

            var conflictingReservation = await _context.Reservations
                .Where(r => r.TableId == table.Id
                    && r.ReservationDate.Date == createReservationDto.ReservationDate.Date
                    && r.Status != ReservationStatus.Cancelled
                    && r.Status != ReservationStatus.Completed
                    && r.Status != ReservationStatus.NoShow)
                .FirstOrDefaultAsync();

            if (conflictingReservation != null)
            {
                return ResponseDto<bool>.Failure($"Table {createReservationDto.TableNumber} is already reserved for this date and time.");
            }

            var userId = _currentUserService.GetCurrentUserId();

            var reservation = new Reservation
            {
                TableId = table.Id,
                CustomerName = createReservationDto.CustomerName,
                CustomerPhone = createReservationDto.CustomerPhone,
                CustomerEmail = createReservationDto.CustomerEmail,
                ReservationDate = createReservationDto.ReservationDate.Date,
                ReservationTime = createReservationDto.ReservationTime,
                NumberOfGuests = createReservationDto.NumberOfGuests,
                Status = ReservationStatus.Pending,
                Notes = createReservationDto.Notes,
                CreatedBy = userId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Reservation {ReservationId} created for table {TableNumber} by {UserId}",
                reservation.Id,
                createReservationDto.TableNumber,
                userId
            );

            return ResponseDto<bool>.SuccessResponse(true, "Reservation created successfully.");
        }

        public async Task<ResponseDto<List<ReservationDto>>> GetAllReservations()
        {
            var reservations = await _context.Reservations
                .Include(r => r.Table)
                .OrderByDescending(r => r.ReservationDate)
                .ThenByDescending(r => r.ReservationTime)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    TableId = r.TableId,
                    TableNumber = r.Table.Number,
                    CustomerName = r.CustomerName,
                    CustomerPhone = r.CustomerPhone,
                    CustomerEmail = r.CustomerEmail,
                    ReservationDate = r.ReservationDate,
                    ReservationTime = r.ReservationTime,
                    NumberOfGuests = r.NumberOfGuests,
                    Status = r.Status.ToString(),
                    Notes = r.Notes,
                    CreatedBy = r.CreatedBy,
                    CreatedAt = r.CreatedAt,
                    UpdatedBy = r.UpdatedBy,
                    UpdatedAt = r.UpdatedAt
                })
                .ToListAsync();

            return ResponseDto<List<ReservationDto>>.SuccessResponse(reservations, "Reservations retrieved successfully.");
        }

        public async Task<ResponseDto<ReservationDto>> GetReservationById(int reservationId)
        {
            var reservation = await _context.Reservations
                .Include(r => r.Table)
                .Where(r => r.Id == reservationId)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    TableId = r.TableId,
                    TableNumber = r.Table.Number,
                    CustomerName = r.CustomerName,
                    CustomerPhone = r.CustomerPhone,
                    CustomerEmail = r.CustomerEmail,
                    ReservationDate = r.ReservationDate,
                    ReservationTime = r.ReservationTime,
                    NumberOfGuests = r.NumberOfGuests,
                    Status = r.Status.ToString(),
                    Notes = r.Notes,
                    CreatedBy = r.CreatedBy,
                    CreatedAt = r.CreatedAt,
                    UpdatedBy = r.UpdatedBy,
                    UpdatedAt = r.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (reservation == null)
            {
                return ResponseDto<ReservationDto>.Failure("Reservation not found.");
            }

            return ResponseDto<ReservationDto>.SuccessResponse(reservation, "Reservation retrieved successfully.");
        }

        public async Task<ResponseDto<List<ReservationDto>>> GetReservationsByTable(int tableNumber)
        {
            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Number == tableNumber);

            if (table == null)
            {
                return ResponseDto<List<ReservationDto>>.Failure("Table not found.");
            }

            var reservations = await _context.Reservations
                .Include(r => r.Table)
                .Where(r => r.TableId == table.Id)
                .OrderByDescending(r => r.ReservationDate)
                .ThenByDescending(r => r.ReservationTime)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    TableId = r.TableId,
                    TableNumber = r.Table.Number,
                    CustomerName = r.CustomerName,
                    CustomerPhone = r.CustomerPhone,
                    CustomerEmail = r.CustomerEmail,
                    ReservationDate = r.ReservationDate,
                    ReservationTime = r.ReservationTime,
                    NumberOfGuests = r.NumberOfGuests,
                    Status = r.Status.ToString(),
                    Notes = r.Notes,
                    CreatedBy = r.CreatedBy,
                    CreatedAt = r.CreatedAt,
                    UpdatedBy = r.UpdatedBy,
                    UpdatedAt = r.UpdatedAt
                })
                .ToListAsync();

            return ResponseDto<List<ReservationDto>>.SuccessResponse(reservations, "Reservations retrieved successfully.");
        }

        public async Task<ResponseDto<List<ReservationDto>>> GetReservationsByDate(DateTime date)
        {
            var reservations = await _context.Reservations
                .Include(r => r.Table)
                .Where(r => r.ReservationDate.Date == date.Date)
                .OrderBy(r => r.ReservationTime)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    TableId = r.TableId,
                    TableNumber = r.Table.Number,
                    CustomerName = r.CustomerName,
                    CustomerPhone = r.CustomerPhone,
                    CustomerEmail = r.CustomerEmail,
                    ReservationDate = r.ReservationDate,
                    ReservationTime = r.ReservationTime,
                    NumberOfGuests = r.NumberOfGuests,
                    Status = r.Status.ToString(),
                    Notes = r.Notes,
                    CreatedBy = r.CreatedBy,
                    CreatedAt = r.CreatedAt,
                    UpdatedBy = r.UpdatedBy,
                    UpdatedAt = r.UpdatedAt
                })
                .ToListAsync();

            return ResponseDto<List<ReservationDto>>.SuccessResponse(reservations, "Reservations retrieved successfully.");
        }

        public async Task<ResponseDto<bool>> UpdateReservation(int reservationId, CreateReservationDto updateReservationDto)
        {
            var reservation = await _context.Reservations
                .Include(r => r.Table)
                .FirstOrDefaultAsync(r => r.Id == reservationId);

            if (reservation == null)
            {
                return ResponseDto<bool>.Failure("Reservation not found.");
            }

            if (reservation.Status == ReservationStatus.Cancelled || 
                reservation.Status == ReservationStatus.Completed)
            {
                return ResponseDto<bool>.Failure("Cannot update a cancelled or completed reservation.");
            }

            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Number == updateReservationDto.TableNumber);

            if (table == null)
            {
                return ResponseDto<bool>.Failure($"Table with number {updateReservationDto.TableNumber} not found.");
            }

            if (updateReservationDto.NumberOfGuests > table.Capacity)
            {
                return ResponseDto<bool>.Failure($"Table {updateReservationDto.TableNumber} can only accommodate {table.Capacity} guests.");
            }

            var conflictingReservation = await _context.Reservations
                .Where(r => r.TableId == table.Id
                    && r.Id != reservationId
                    && r.ReservationDate.Date == updateReservationDto.ReservationDate.Date
                    && r.Status != ReservationStatus.Cancelled
                    && r.Status != ReservationStatus.Completed
                    && r.Status != ReservationStatus.NoShow)
                .FirstOrDefaultAsync();

            if (conflictingReservation != null)
            {
                return ResponseDto<bool>.Failure($"Table {updateReservationDto.TableNumber} is already reserved for this date and time.");
            }

            reservation.TableId = table.Id;
            reservation.CustomerName = updateReservationDto.CustomerName;
            reservation.CustomerPhone = updateReservationDto.CustomerPhone;
            reservation.CustomerEmail = updateReservationDto.CustomerEmail;
            reservation.ReservationDate = updateReservationDto.ReservationDate.Date;
            reservation.ReservationTime = updateReservationDto.ReservationTime;
            reservation.NumberOfGuests = updateReservationDto.NumberOfGuests;
            reservation.Notes = updateReservationDto.Notes;
            reservation.UpdatedBy = _currentUserService.GetCurrentUserId() ?? "System";
            reservation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Reservation {ReservationId} updated by {UserId}",
                reservationId,
                _currentUserService.GetCurrentUserId()
            );

            return ResponseDto<bool>.SuccessResponse(true, "Reservation updated successfully.");
        }

        public async Task<ResponseDto<bool>> UpdateReservationStatus(int reservationId, string status)
        {
            var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId);

            if (reservation == null)
            {
                return ResponseDto<bool>.Failure("Reservation not found.");
            }

            if (!Enum.TryParse<ReservationStatus>(status, true, out var parsedStatus))
            {
                return ResponseDto<bool>.Failure("Invalid reservation status.");
            }

            reservation.Status = parsedStatus;
            reservation.UpdatedBy = _currentUserService.GetCurrentUserId() ?? "System";
            reservation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Reservation {ReservationId} status updated to {Status} by {UserId}",
                reservationId,
                parsedStatus,
                _currentUserService.GetCurrentUserId()
            );

            return ResponseDto<bool>.SuccessResponse(true, "Reservation status updated successfully.");
        }

        public async Task<ResponseDto<bool>> CancelReservation(int reservationId)
        {
            var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId);

            if (reservation == null)
            {
                return ResponseDto<bool>.Failure("Reservation not found.");
            }

            if (reservation.Status == ReservationStatus.Cancelled)
            {
                return ResponseDto<bool>.Failure("Reservation is already cancelled.");
            }

            if (reservation.Status == ReservationStatus.Completed)
            {
                return ResponseDto<bool>.Failure("Cannot cancel a completed reservation.");
            }

            reservation.Status = ReservationStatus.Cancelled;
            reservation.UpdatedBy = _currentUserService.GetCurrentUserId() ?? "System";
            reservation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Reservation {ReservationId} cancelled by {UserId}",
                reservationId,
                _currentUserService.GetCurrentUserId()
            );

            return ResponseDto<bool>.SuccessResponse(true, "Reservation cancelled successfully.");
        }

        public async Task<ResponseDto<bool>> DeleteReservation(int reservationId)
        {
            var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId);

            if (reservation == null)
            {
                return ResponseDto<bool>.Failure("Reservation not found.");
            }

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Reservation {ReservationId} deleted by {UserId}",
                reservationId,
                _currentUserService.GetCurrentUserId()
            );

            return ResponseDto<bool>.SuccessResponse(true, "Reservation deleted successfully.");
        }
    }
}

