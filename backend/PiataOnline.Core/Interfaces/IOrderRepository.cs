using PiataOnline.Core.Entities;
using PiataOnline.Core.Enums;

namespace PiataOnline.Core.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId, int page, int pageSize);
    Task<IEnumerable<Order>> GetOrdersByStallIdAsync(int stallId, int page, int pageSize);
    Task<Order?> GetOrderWithDetailsAsync(int id);
    Task<IEnumerable<Order>> GetActiveOrdersByStallIdAsync(int stallId);
    Task<IEnumerable<Order>> GetByStallIdAsync(int stallId);
    
    // Admin Optimizations
    Task<IEnumerable<Order>> GetAllOrdersWithRelationsAsync();
    Task<Dictionary<int, int>> GetOrderCountsByUserIdsAsync(IEnumerable<int> userIds);
}
