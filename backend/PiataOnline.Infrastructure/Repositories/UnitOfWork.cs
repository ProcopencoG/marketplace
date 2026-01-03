using Microsoft.EntityFrameworkCore.Storage;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;
using PiataOnline.Infrastructure.Data;

namespace PiataOnline.Infrastructure.Repositories;

/// <summary>
/// Unit of Work implementation - manages transactions across multiple repositories
/// </summary>
public class UnitOfWork : IUnitOfWork, IAsyncDisposable
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    // Lazy-initialized repositories
    private IStallRepository? _stalls;
    private IProductRepository? _products;
    private IOrderRepository? _orders;
    private IOrderItemRepository? _orderItems; // Added backing field
    private IUserRepository? _users;
    private ICartRepository? _carts;
    private ICartItemRepository? _cartItems;
    private IReviewRepository? _reviews;
    private IMessageRepository? _messages;
    private INotificationRepository? _notifications;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IStallRepository Stalls => _stalls ??= new StallRepository(_context);
    public IProductRepository Products => _products ??= new ProductRepository(_context);
    public IOrderRepository Orders => _orders ??= new OrderRepository(_context);
    public IOrderItemRepository OrderItems => _orderItems ??= new OrderItemRepository(_context); // Added
    public IUserRepository Users => _users ??= new UserRepository(_context);
    public ICartRepository Carts => _carts ??= new CartRepository(_context);
    public ICartItemRepository CartItems => _cartItems ??= new CartItemRepository(_context);
    public IReviewRepository Reviews => _reviews ??= new ReviewRepository(_context);
    public IMessageRepository Messages => _messages ??= new MessageRepository(_context);
    public INotificationRepository Notifications => _notifications ??= new NotificationRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    public async ValueTask DisposeAsync()
    {
        if (_transaction != null)
        {
            await _transaction.DisposeAsync();
        }
        await _context.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}
