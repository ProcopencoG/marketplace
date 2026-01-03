using Microsoft.EntityFrameworkCore;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Enums;
using PiataOnline.Core.Interfaces;
using PiataOnline.Infrastructure.Data;

namespace PiataOnline.Infrastructure.Repositories;

public class StallRepository : GenericRepository<Stall>, IStallRepository
{
    public StallRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Stall>> GetActiveStallsByLocationAsync(string location)
    {
        return await _dbSet
            .Where(s => s.DeletedAt == null && s.Location == location && s.Status == StallStatus.Approved)
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Stall>> SearchStallsByNameAsync(string searchTerm)
    {
        return await _dbSet
            .Where(s => s.DeletedAt == null && s.Name.Contains(searchTerm))
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<Stall?> GetStallWithProductsAsync(int id)
    {
        return await _dbSet
            .Include(s => s.Products.Where(p => p.DeletedAt == null))
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id && s.DeletedAt == null);
    }

    public async Task<double> CalculateAverageRatingAsync(int stallId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.Product.StallId == stallId)
            .ToListAsync();

        return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
    }

    public async Task<int> GetReviewsCountAsync(int stallId)
    {
        return await _context.Reviews
            .CountAsync(r => r.Product.StallId == stallId);
    }

    public async Task<IEnumerable<Stall>> GetStallsWithOwnersAsync()
    {
        return await _dbSet
            .Include(s => s.User)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<Stall?> GetByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == userId && s.DeletedAt == null);
    }

    public async Task<Dictionary<int, double>> GetAverageRatingsAsync(List<int> stallIds)
    {
        if (stallIds == null || stallIds.Count == 0)
            return new Dictionary<int, double>();

        return await _context.Reviews
            .Where(r => stallIds.Contains(r.Product.StallId))
            .GroupBy(r => r.Product.StallId)
            .Select(g => new { StallId = g.Key, Avg = g.Average(r => r.Rating) })
            .ToDictionaryAsync(x => x.StallId, x => x.Avg);
    }

    public async Task<Dictionary<int, int>> GetReviewCountsAsync(List<int> stallIds)
    {
        if (stallIds == null || stallIds.Count == 0)
            return new Dictionary<int, int>();

        return await _context.Reviews
            .Where(r => stallIds.Contains(r.Product.StallId))
            .GroupBy(r => r.Product.StallId)
            .Select(g => new { StallId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.StallId, x => x.Count);
    }
}
