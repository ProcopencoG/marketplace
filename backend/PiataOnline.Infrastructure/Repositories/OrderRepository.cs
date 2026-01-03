using Microsoft.EntityFrameworkCore;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Enums;
using PiataOnline.Core.Interfaces;
using PiataOnline.Infrastructure.Data;

namespace PiataOnline.Infrastructure.Repositories;

public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId, int page, int pageSize)
    {
        return await _dbSet
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.Status == OrderStatus.NewOrder ? 1 : 
                                    o.Status == OrderStatus.Confirmed ? 2 : 
                                    o.Status == OrderStatus.Completed ? 3 : 4)
            .ThenByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(o => o.Stall)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetOrdersByStallIdAsync(int stallId, int page, int pageSize)
    {
        return await _dbSet
            .Where(o => o.StallId == stallId)
            .OrderByDescending(o => o.Status == OrderStatus.NewOrder ? 1 : 
                                    o.Status == OrderStatus.Confirmed ? 2 : 
                                    o.Status == OrderStatus.Completed ? 3 : 4)
            .ThenByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(o => o.User)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(o => o.User)
            .Include(o => o.Stall)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Include(o => o.Messages)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<IEnumerable<Order>> GetActiveOrdersByStallIdAsync(int stallId)
    {
        return await _dbSet
            .Where(o => o.StallId == stallId && o.Status != OrderStatus.Cancelled)
            .ToListAsync();
    }
    public async Task<IEnumerable<Order>> GetByStallIdAsync(int stallId)
    {
        return await _dbSet
            .Where(o => o.StallId == stallId)
            .Include(o => o.User)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetAllOrdersWithRelationsAsync()
    {
        return await _dbSet
            .Include(o => o.User)
            .Include(o => o.Stall)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Dictionary<int, int>> GetOrderCountsByUserIdsAsync(IEnumerable<int> userIds)
    {
        return await _dbSet
            .Where(o => userIds.Contains(o.UserId))
            .GroupBy(o => o.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count);
    }
}
