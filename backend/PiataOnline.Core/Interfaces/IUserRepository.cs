using PiataOnline.Core.Entities;

namespace PiataOnline.Core.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<IEnumerable<User>> GetUsersWithStatsAsync();
}
