using Microsoft.EntityFrameworkCore;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;
using PiataOnline.Infrastructure.Data;

namespace PiataOnline.Infrastructure.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<User>> GetUsersWithStatsAsync()
    {
        // This is still slightly N+1 if we don't return a DTO, 
        // because User entity doesn't have "OrderCount".
        // However, we can use EF Core explicit loading or projection.
        // But since we need to return "IEnumerable<User>", we can't easily attach the count unless we add [NotMapped] property.
        // For now, let's Optimize the Stalls part which is 1:1.
        
        // Strategy: Fetch Users + Stalls eagerly.
        return await _dbSet
            .Include(u => u.Stall)
            .OrderBy(u => u.Name)
            .ToListAsync();
            
        // Note: OrderCount optimization is tricky without changing Entity or return type.
        // AdminController logic: 
        // var ordersCount = (await _unitOfWork.Orders.GetOrdersByUserIdAsync(u.Id, 1, 10000)).Count();
        // This is the heavy part.
        // I will address this by adding a method in IOrderRepository to get counts dictionary.
    }
}
