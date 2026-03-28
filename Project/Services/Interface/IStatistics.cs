using Project.Dtos.Responses;

namespace Project.Services.Interface
{
    public interface IStatistics
    {
        Task<ResponseDto<StatisticsOverviewDto>> GetOverview(DateTime? from = null, DateTime? to = null);
        Task<ResponseDto<List<TopMenuItemDto>>> GetTopMenuItems(int limit = 5, DateTime? from = null, DateTime? to = null);
    }
}

