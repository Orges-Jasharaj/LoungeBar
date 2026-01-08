using Microsoft.EntityFrameworkCore;
using Project.Data;
using Project.Data.Models;
using Project.Dtos.Requests;
using Project.Dtos.Responses;
using Project.Services.Interface;

namespace Project.Services.Implementation
{
    public class ShiftService : IShift
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ShiftService> _logger;
        private readonly CurrentUserService _currentUserService;

        public ShiftService(AppDbContext context, ILogger<ShiftService> logger, CurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<ResponseDto<bool>> CreateShift(CreateShiftDto createShiftDto)
        {
            var userId = _currentUserService.GetCurrentUserId();

            if(string.IsNullOrEmpty(createShiftDto.UserId))
            {
                return ResponseDto<bool>.Failure("UserId is required to create a shift.");
            }

            var shift = await _context.Shifts
                .FirstOrDefaultAsync(s => s.UserId == createShiftDto.UserId && s.EndTime == null);

            if (shift != null)
            {
                return ResponseDto<bool>.Failure("User already has an active shift.");
            }

            var newShift = new Shift
            {
                UserId = createShiftDto.UserId,
                ShiftType = createShiftDto.ShiftType,
                Notes = createShiftDto.Notes,
                CreatedBy = userId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            _context.Shifts.Add(newShift);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Shift created for User {UserId} by {CreatedBy}", createShiftDto.UserId, userId ?? "System");
            return ResponseDto<bool>.SuccessResponse(true, "Shift created successfully.");

        }

        public async Task<ResponseDto<bool>> DeleteShift(int shiftId)
        {
            var shift = await _context.Shifts
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == shiftId);
            
            if (shift == null)
            {
                return ResponseDto<bool>.Failure("Shift not found.");
            }

            // Check if shift has associated orders
            var hasOrders = await _context.Orders.AnyAsync(o => o.ShiftId == shiftId);
            
            // Soft delete: Mark as inactive and set end time if not already set
            shift.IsActive = false;
            if (shift.EndTime == null)
            {
                shift.EndTime = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            
            var message = hasOrders 
                ? "Shift archived successfully (has associated orders)." 
                : "Shift deleted successfully.";
            
            _logger.LogInformation("Shift {ShiftId} soft deleted by {DeletedBy}. Has orders: {HasOrders}", 
                shiftId, _currentUserService.GetCurrentUserId() ?? "System", hasOrders);
            
            return ResponseDto<bool>.SuccessResponse(true, message);
        }

        public async Task<ResponseDto<List<ShiftDto>>> GetAllShifts()
        {
            var shifts = await _context.Shifts
                .Include(s => s.User)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
            var shiftDtos = shifts.Select(s => new ShiftDto
            {
                Id = s.Id,
                UserId = s.UserId,
                UserName = s.User != null 
                    ? (!string.IsNullOrWhiteSpace(s.User.FirstName) || !string.IsNullOrWhiteSpace(s.User.LastName)
                        ? $"{s.User.FirstName ?? ""} {s.User.LastName ?? ""}".Trim()
                        : s.User.Email ?? s.User.UserName ?? s.UserId)
                    : null,
                ShiftType = s.ShiftType,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                IsActive = s.IsActive,
                Notes = s.Notes
            }).ToList();
            return ResponseDto<List<ShiftDto>>.SuccessResponse(shiftDtos, "Shifts retrieved successfully.");

        }

        public async Task<ResponseDto<ShiftDto>> GetMyShift()
        {
            var shift = await _context.Shifts
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == _currentUserService.GetCurrentUserId() && s.EndTime == null);
            if (shift == null)
                {
                return ResponseDto<ShiftDto>.Failure("No active shift found for the current user.");
            }
            var shiftDto = new ShiftDto
            {
                Id = shift.Id,
                UserId = shift.UserId,
                UserName = shift.User != null ? $"{shift.User.FirstName} {shift.User.LastName}" : null,
                ShiftType = shift.ShiftType,
                StartTime = shift.StartTime,
                EndTime = shift.EndTime,
                IsActive = shift.IsActive,
                Notes = shift.Notes
            };
            return ResponseDto<ShiftDto>.SuccessResponse(shiftDto, "Active shift retrieved successfully.");
        }

        public async Task<ResponseDto<ShiftDto>> GetShiftById(int shiftId)
        {
            var shift = await _context.Shifts
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == shiftId);
            if (shift == null)
            {
                return ResponseDto<ShiftDto>.Failure("Shift not found.");
            }
            var shiftDto = new ShiftDto
            {
                Id = shift.Id,
                UserId = shift.UserId,
                UserName = shift.User != null ? $"{shift.User.FirstName} {shift.User.LastName}" : null,
                ShiftType = shift.ShiftType,
                StartTime = shift.StartTime,
                EndTime = shift.EndTime,
                IsActive = shift.IsActive,
                Notes = shift.Notes
            };
            return ResponseDto<ShiftDto>.SuccessResponse(shiftDto, "Shift retrieved successfully.");
        }

        public async Task<ResponseDto<bool>> Start()
        {
            var userId = _currentUserService.GetCurrentUserId();

            var shift = await _context.Shifts
                .FirstOrDefaultAsync(s => s.UserId == userId && s.EndTime == null);

            if (shift == null)
            {
                return ResponseDto<bool>.Failure("Active shift not found for this user.");
            }

            shift.StartTime = DateTime.Now;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Shift for User {UserId} started by {UpdatedBy}", userId, userId ?? "System");

            return ResponseDto<bool>.SuccessResponse(true, "Shift started successfully.");
        }

        public async Task<ResponseDto<bool>> Stop()
        {
            var userId = _currentUserService.GetCurrentUserId();

            var shift = await _context.Shifts
                .FirstOrDefaultAsync(s => s.UserId == userId && s.EndTime == null);

            if (shift == null)
            {
                return ResponseDto<bool>.Failure("Active shift not found for this user.");
            }

            shift.EndTime = DateTime.Now;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Shift for User {UserId} stopped by {UpdatedBy}", userId, userId ?? "System");

            return ResponseDto<bool>.SuccessResponse(true, "Shift stopped successfully.");
        }


        public async Task<ResponseDto<bool>> UpdateShift(int shiftId, CreateShiftDto updateShiftDto)
        {
            var shift = await _context.Shifts.FindAsync(shiftId);
            if (shift == null)
            {
                return ResponseDto<bool>.Failure("Shift not found.");
            }
            shift.UserId = updateShiftDto.UserId;
            shift.ShiftType = updateShiftDto.ShiftType;
            shift.Notes = updateShiftDto.Notes;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Shift {ShiftId} updated by {UpdatedBy}", shiftId, _currentUserService.GetCurrentUserId() ?? "System");
            return ResponseDto<bool>.SuccessResponse(true, "Shift updated successfully.");
        }
    }
}
