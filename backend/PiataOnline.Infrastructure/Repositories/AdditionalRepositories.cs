using Microsoft.EntityFrameworkCore;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;
using PiataOnline.Infrastructure.Data;

namespace PiataOnline.Infrastructure.Repositories;

public class ReviewRepository : GenericRepository<Review>, IReviewRepository
{
    public ReviewRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Review>> GetByProductIdAsync(int productId)
    {
        return await _dbSet
            .Where(r => r.ProductId == productId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetByUserIdAsync(int userId)
    {
        return await _dbSet
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
}

public class MessageRepository : GenericRepository<Message>, IMessageRepository
{
    public MessageRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Message>> GetByOrderIdAsync(int orderId)
    {
        return await _dbSet
            .Where(m => m.OrderId == orderId)
            .Include(m => m.User)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }
}

public class CartRepository : GenericRepository<Cart>, ICartRepository
{
    public CartRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Cart?> GetCartWithItemsAsync(int userId)
    {
        return await _dbSet
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }
}

public class CartItemRepository : GenericRepository<CartItem>, ICartItemRepository
{
    public CartItemRepository(ApplicationDbContext context) : base(context) { }
}

public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId)
    {
        return await _dbSet
            .Where(n => n.RecipientId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _dbSet
            .CountAsync(n => n.RecipientId == userId && !n.IsRead);
    }
}
