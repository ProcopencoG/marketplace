using PiataOnline.Core.Entities;

namespace PiataOnline.Core.Interfaces;

public interface IStallRepository : IRepository<Stall>
{
    Task<IEnumerable<Stall>> GetActiveStallsByLocationAsync(string location);
    Task<IEnumerable<Stall>> SearchStallsByNameAsync(string searchTerm);
    Task<Stall?> GetStallWithProductsAsync(int id);
    Task<double> CalculateAverageRatingAsync(int stallId);
    Task<int> GetReviewsCountAsync(int stallId);
    Task<IEnumerable<Stall>> GetStallsWithOwnersAsync();
    Task<Stall?> GetByUserIdAsync(int userId);
    
    // Batch methods to avoid N+1 queries
    Task<Dictionary<int, double>> GetAverageRatingsAsync(List<int> stallIds);
    Task<Dictionary<int, int>> GetReviewCountsAsync(List<int> stallIds);
}
