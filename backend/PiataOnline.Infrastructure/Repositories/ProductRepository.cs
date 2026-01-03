using Microsoft.EntityFrameworkCore;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;
using PiataOnline.Infrastructure.Data;

namespace PiataOnline.Infrastructure.Repositories;

public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Product>> GetActiveProductsAsync()
    {
        return await _dbSet
            .Where(p => p.DeletedAt == null)
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetProductsByStallAsync(int stallId)
    {
        return await _dbSet
            .Where(p => p.StallId == stallId && p.DeletedAt == null)
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetActiveProductsByStallIdAsync(int stallId)
    {
        return await _dbSet
            .Where(p => p.StallId == stallId && p.DeletedAt == null)
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<Product?> GetProductWithReviewsAsync(int id)
    {
        return await _dbSet
            .Include(p => p.Reviews)
            .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<double> CalculateAverageRatingAsync(int productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId)
            .ToListAsync();

        return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
    }

    public async Task<IEnumerable<Product>> GetByStallIdAsync(int stallId)
    {
        return await _dbSet
            .Where(p => p.StallId == stallId && p.DeletedAt == null)
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task SoftDeleteAsync(int id)
    {
        var product = await GetByIdAsync(id);
        if (product != null)
        {
            product.DeletedAt = DateTime.UtcNow;
            await UpdateAsync(product);
        }
    }
}
