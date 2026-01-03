using PiataOnline.Core.Entities;

namespace PiataOnline.Core.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<IEnumerable<Product>> GetActiveProductsAsync();
    Task<IEnumerable<Product>> GetProductsByStallAsync(int stallId);
    Task<IEnumerable<Product>> GetActiveProductsByStallIdAsync(int stallId);
    Task<IEnumerable<Product>> GetByStallIdAsync(int stallId);
    Task<Product?> GetProductWithReviewsAsync(int id);
    Task<double> CalculateAverageRatingAsync(int productId);
    Task SoftDeleteAsync(int id);
}
