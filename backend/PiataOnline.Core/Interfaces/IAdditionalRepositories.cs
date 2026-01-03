using PiataOnline.Core.Entities;

namespace PiataOnline.Core.Interfaces;

public interface IReviewRepository : IRepository<Review>
{
    Task<IEnumerable<Review>> GetByProductIdAsync(int productId);
    Task<IEnumerable<Review>> GetByUserIdAsync(int userId);
}

public interface IMessageRepository : IRepository<Message>
{
    Task<IEnumerable<Message>> GetByOrderIdAsync(int orderId);
}

public interface ICartRepository : IRepository<Cart>
{
    Task<Cart?> GetCartWithItemsAsync(int userId);
}

public interface ICartItemRepository : IRepository<CartItem>
{
}

public interface INotificationRepository : IRepository<Notification>
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
}
