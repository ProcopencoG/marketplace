using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;
using PiataOnline.Infrastructure.Data;

namespace PiataOnline.Infrastructure.Repositories;

public class OrderItemRepository : GenericRepository<OrderItem>, IOrderItemRepository
{
    public OrderItemRepository(ApplicationDbContext context) : base(context)
    {
    }
}
