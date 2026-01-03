using PiataOnline.Core.Entities;

namespace PiataOnline.Core.Interfaces;

/// <summary>
/// Unit of Work pattern - manages transactions across multiple repositories
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IStallRepository Stalls { get; }
    IProductRepository Products { get; }
    IOrderRepository Orders { get; }
    IUserRepository Users { get; }
    ICartRepository Carts { get; }
    ICartItemRepository CartItems { get; }
    IOrderItemRepository OrderItems { get; } // Exposed for admin cleanup
    IReviewRepository Reviews { get; }
    IMessageRepository Messages { get; }
    INotificationRepository Notifications { get; }
    
    /// <summary>
    /// Saves all changes made in this unit of work to the database
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Begins a database transaction
    /// </summary>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Commits the current transaction
    /// </summary>
    Task CommitAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Rolls back the current transaction
    /// </summary>
    Task RollbackAsync(CancellationToken cancellationToken = default);
}
