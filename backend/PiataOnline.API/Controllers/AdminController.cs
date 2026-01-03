using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;
using System.IO; // Added for File operations

namespace PiataOnline.API.Controllers;

[ApiController]
[Route("api/admin")] // Frontend uses /api/admin/admins
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminController> _logger;
    private readonly IWebHostEnvironment _env;

    private readonly IConfiguration _configuration;

    public AdminController(IUnitOfWork unitOfWork, ILogger<AdminController> logger, IWebHostEnvironment env, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _env = env;
        _configuration = configuration;
    }

    private string OwnerEmail => _configuration["JwtSettings:OwnerEmail"] ?? "";

    [HttpGet("admins")]
    public async Task<ActionResult<object>> GetAdmins()
    {
        var admins = await _unitOfWork.Users.FindAsync(u => u.IsAdmin);
        
        return Ok(new 
        { 
            admins = admins.Select(u => new 
            {
                id = u.Id,
                name = u.Name,
                email = u.Email,
                avatar = u.AvatarUrl,
                isOwner = !string.IsNullOrEmpty(OwnerEmail) && u.Email == OwnerEmail,
                createdAt = u.CreatedAt
            })
        });
    }

    // --- DASHBOARD ---
    [HttpGet("dashboard")]
    public async Task<ActionResult<object>> GetDashboardStats()
    {
        var usersCount = (await _unitOfWork.Users.GetAllAsync()).Count();
        var stallsCount = (await _unitOfWork.Stalls.GetAllAsync()).Count(s => s.IsActive);
        var orders = await _unitOfWork.Orders.GetAllAsync(); // Still fetching all to sum price, could optimize further but accepted for now
        var totalRevenue = orders.Sum(o => o.TotalPrice);
        
        var recentOrders = orders.OrderByDescending(o => o.CreatedAt).Take(5).Select(o => new 
        {
            id = o.Id,
            customer = "Client #" + o.UserId, 
            amount = o.TotalPrice,
            status = o.Status.ToString(),
            date = o.CreatedAt
        });

        // Generate last 30 days
        var last30Days = Enumerable.Range(0, 30)
            .Select(i => DateTime.UtcNow.Date.AddDays(-29 + i))
            .ToList();

        var revenueChartData = last30Days.Select(date => new 
        {
            date = date.ToString("dd/MM"),
            revenue = orders
                .Where(o => o.CreatedAt.Date == date && o.Status != PiataOnline.Core.Enums.OrderStatus.Cancelled)
                .Sum(o => o.TotalPrice)
        }).ToList();

        return Ok(new 
        { 
            metrics = new 
            {
                totalUsers = usersCount,
                totalOrders = orders.Count(),
                totalRevenue = totalRevenue,
                totalStalls = (await _unitOfWork.Stalls.GetAllAsync()).Count(),
                pendingStalls = (await _unitOfWork.Stalls.GetAllAsync()).Count(s => s.Status == PiataOnline.Core.Enums.StallStatus.Pending)
            },
            revenueChartData = revenueChartData,
            recentActivity = recentOrders
        });
    }

    // --- ORDERS MANAGEMENT ---
    [HttpGet("orders")]
    public async Task<ActionResult<object>> GetAllOrders()
    {
        // Optimized: Uses eager loading
        var orders = await _unitOfWork.Orders.GetAllOrdersWithRelationsAsync();
        
        var orderDtos = orders.Select(order => new 
        {
            id = order.Id,
            customerName = order.User?.Name ?? "Unknown",
            stallName = order.Stall?.Name ?? "Unknown",
            totalAmount = order.TotalPrice,
            status = order.Status.ToString(),
            createdAt = order.CreatedAt,
            itemsCount = 1 
        });

        return Ok(new { orders = orderDtos });
    }

    [HttpGet("orders/{id}")]
    public async Task<ActionResult<object>> GetOrderById(int id)
    {
        var order = await _unitOfWork.Orders.GetOrderWithDetailsAsync(id);
        if (order == null) return NotFound();

        var user = order.User;
        var stall = order.Stall;
        
        // Items
        var orderItems = order.OrderItems != null 
            ? order.OrderItems.Select(i => new 
            {
                id = i.Id,
                quantity = i.Quantity,
                price_cents = i.PriceCents,
                product = new 
                {
                    id = i.Product?.Id ?? 0,
                    name = i.Product?.Name ?? "Produs Șters",
                    image = i.Product?.ImageUrl
                }
            }).ToList<object>() 
            : new List<object>();

        // Messages
        var messages = await _unitOfWork.Messages.FindAsync(m => m.OrderId == id);
        var messageDtos = new List<object>();
        foreach(var m in messages)
        {
            var msgUser = await _unitOfWork.Users.GetByIdAsync(m.UserId); // Fixed: SenderId -> UserId
            messageDtos.Add(new 
            {
                id = m.Id,
                content = m.Content,
                created_at = m.CreatedAt,
                user = new { id = msgUser?.Id ?? 0, name = msgUser?.Name ?? "Unknown" }
            });
        }

        // Return structure matching frontend OrderData interface
        return Ok(new 
        {
            order = new 
            {
                id = order.Id,
                created_at = order.CreatedAt,
                status = order.Status.ToString(),
                total_cents = order.TotalCents, 
                order_items = orderItems, 
                messages = messageDtos
            },
            buyer = new 
            {
                id = user?.Id ?? 0,
                name = user?.Name ?? "Unknown",
                email = user?.Email ?? "Unknown"
            },
            stall = new 
            {
                id = stall?.Id ?? 0,
                name = stall?.Name ?? "Unknown"
            },
            total = order.TotalPrice,
            formattedStatus = order.Status.ToString()
        });
    }

    // --- USERS MANAGEMENT ---

    [HttpGet("users")]
    public async Task<ActionResult<object>> GetAllUsers()
    {
        // Optimized fetch: Get users with stalls eagerly loaded
        var users = await _unitOfWork.Users.GetUsersWithStatsAsync();
        
        // Optimize Order Counts (avoid N+1)
        var userIds = users.Select(u => u.Id).ToList();
        var orderCounts = await _unitOfWork.Orders.GetOrderCountsByUserIdsAsync(userIds);

        var userDtos = users.Select(u => new 
        {
            id = u.Id,
            name = u.Name,
            email = u.Email,
            created_at = u.CreatedAt,
            provider = u.Provider,
            location = u.Location,
            avatar_url = u.AvatarUrl,
            hasStall = u.Stall != null,
            ordersCount = orderCounts.ContainsKey(u.Id) ? orderCounts[u.Id] : 0
        });

        return Ok(new { users = userDtos });
    }

    [HttpGet("users/{id}")]
    public async Task<ActionResult<object>> GetUserById(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound("User not found");

        var orders = await _unitOfWork.Orders.GetOrdersByUserIdAsync(id, 1, 100); 
        var orderDtos = new List<object>();

        foreach(var order in orders)
        {
            var stall = await _unitOfWork.Stalls.GetByIdAsync(order.StallId);
            orderDtos.Add(new 
            {
                id = order.Id,
                created_at = order.CreatedAt,
                total_cents = order.TotalCents,
                status = order.Status.ToString(),
                stallName = stall?.Name ?? "Unknown",
                total = order.TotalPrice
            });
        }

        return Ok(new 
        {
            user = new 
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                avatar_url = user.AvatarUrl,
                location = user.Location,
                created_at = user.CreatedAt
            },
            orders = orderDtos
        });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound("User not found");
        
        if (!string.IsNullOrEmpty(OwnerEmail) && user.Email == OwnerEmail) return BadRequest("Cannot delete owner");
        if (user.Email == User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value) return BadRequest("Cannot delete yourself");

        // 1. Delete Stalls (User is Seller) -> Cascade to Stall's Products & Orders
        var stalls = await _unitOfWork.Stalls.FindAsync(s => s.UserId == id);
        foreach(var s in stalls)
        {
            await DeleteStallRecursively(s);
        }

        // 2. Delete Orders (User is Buyer)
        var buyerOrders = await _unitOfWork.Orders.GetOrdersByUserIdAsync(id, 1, 10000); // User might have many
        foreach(var oStub in buyerOrders)
        {
             var o = await _unitOfWork.Orders.GetOrderWithDetailsAsync(oStub.Id);
             if (o == null) continue;

             var msgs = await _unitOfWork.Messages.FindAsync(m => m.OrderId == o.Id);
             foreach(var m in msgs) await _unitOfWork.Messages.DeleteAsync(m);

             var reviews = await _unitOfWork.Reviews.FindAsync(r => r.OrderId == o.Id);
             foreach(var r in reviews) await _unitOfWork.Reviews.DeleteAsync(r);

             await _unitOfWork.Orders.DeleteAsync(o);
        }

        // 3. Delete Messages (User is Sender - mostly in chats not covered above)
        var userMessages = await _unitOfWork.Messages.FindAsync(m => m.UserId == id);
        foreach(var m in userMessages)
        {
            await _unitOfWork.Messages.DeleteAsync(m);
        }

        // 4. Delete Carts and CartItems
        var carts = await _unitOfWork.Carts.FindAsync(c => c.UserId == id);
        foreach(var c in carts)
        {
             var items = await _unitOfWork.CartItems.FindAsync(ci => ci.CartId == c.Id);
             foreach(var item in items) await _unitOfWork.CartItems.DeleteAsync(item);
             await _unitOfWork.Carts.DeleteAsync(c);
        }

        // 5. Delete Reviews (User is Author)
        var userReviews = await _unitOfWork.Reviews.FindAsync(r => r.UserId == id);
        foreach(var r in userReviews)
        {
            await _unitOfWork.Reviews.DeleteAsync(r);
        }

        // 6. Delete Notifications
        var notifications = await _unitOfWork.Notifications.FindAsync(n => n.RecipientId == id);
        foreach(var n in notifications)
        {
            await _unitOfWork.Notifications.DeleteAsync(n);
        }

        await _unitOfWork.Users.DeleteAsync(user);
        await _unitOfWork.SaveChangesAsync();
        
        return Ok(new { message = "User deleted" });
    }

    // --- STALLS MANAGEMENT ---

    [HttpGet("stalls")]
    public async Task<ActionResult<object>> GetAllStalls([FromQuery] string? status)
    {
        // Optimized fetch: Get stalls AND owners in one DB query
        var stalls = await _unitOfWork.Stalls.GetStallsWithOwnersAsync();
        
        if (!string.IsNullOrEmpty(status))
        {
            if (Enum.TryParse<PiataOnline.Core.Enums.StallStatus>(status, true, out var statusEnum))
            {
                stalls = stalls.Where(s => s.Status == statusEnum);
            }
        }

        var stallDtos = stalls.Select(s => new 
        {
            id = s.Id,
            name = s.Name,
            ownerName = s.User?.Name ?? "Unknown", // Accessed from Eager Loaded property
            ownerEmail = s.User?.Email ?? "Unknown",
            status = s.Status.ToString().ToLower(),
            created_at = s.CreatedAt,
            location = s.Location
        });

        return Ok(new { stalls = stallDtos });
    }



    [HttpGet("stalls/{id}")]
    public async Task<ActionResult<object>> GetStallById(int id)
    {
        var stall = await _unitOfWork.Stalls.GetByIdAsync(id);
        if (stall == null) return NotFound("Stall not found");

        var owner = await _unitOfWork.Users.GetByIdAsync(stall.UserId);
        
        var orders = await _unitOfWork.Orders.GetOrdersByStallIdAsync(id, 1, 100000); 
        var totalSales = orders.Sum(o => o.TotalPrice);
        
        // Fixed: GetProductsByStallIdAsync -> GetProductsByStallAsync
        var products = await _unitOfWork.Products.GetProductsByStallAsync(id); 
        
        return Ok(new 
        {
            stall = new 
            {
                id = stall.Id,
                name = stall.Name,
                description = stall.Description,
                status = stall.Status.ToString().ToLower(),
                created_at = stall.CreatedAt,
                location = stall.Location,
                cover_url = stall.CoverUrl,
                logo_url = stall.LogoUrl,
                rating = 0,
                reviews_count = 0
            },
            owner = new 
            {
                id = owner?.Id ?? 0,
                name = owner?.Name ?? "Unknown",
                email = owner?.Email ?? "Unknown",
                phone = "" 
            },
            stats = new 
            {
                totalSales = totalSales,
                ordersCount = orders.Count(),
                productsCount = products.Count()
            },
            products = products.Select(p => new 
            {
                id = p.Id,
                name = p.Name,
                price_cents = p.PriceCents,
                image_url = p.ImageUrl
            })
        });
    }

    [HttpPatch("stalls/{id}/approve")]
    public async Task<IActionResult> ApproveStall(int id)
    {
        var stall = await _unitOfWork.Stalls.GetByIdAsync(id);
        if (stall == null) return NotFound("Stall not found");

        stall.Status = PiataOnline.Core.Enums.StallStatus.Approved;
        await _unitOfWork.Stalls.UpdateAsync(stall);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Stall approved" });
    }

    [HttpPatch("stalls/{id}/reject")]
    public async Task<IActionResult> RejectStall(int id)
    {
        var stall = await _unitOfWork.Stalls.GetByIdAsync(id);
        if (stall == null) return NotFound("Stall not found");

        stall.Status = PiataOnline.Core.Enums.StallStatus.Rejected;
        await _unitOfWork.Stalls.UpdateAsync(stall);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Stall rejected" });
    }

    [HttpDelete("stalls/{id}")]
    public async Task<IActionResult> DeleteStall(int id)
    {
        var stall = await _unitOfWork.Stalls.GetByIdAsync(id);
        if (stall == null) return NotFound("Stall not found");

        await DeleteStallRecursively(stall);
        await _unitOfWork.SaveChangesAsync();
        return Ok(new { message = "Stall deleted" });
    }

    private async Task DeleteStallRecursively(Stall s)
    {
        // 1. Delete Orders received by this stall
        var stallOrders = await _unitOfWork.Orders.GetByStallIdAsync(s.Id);
        foreach(var oStub in stallOrders)
        {
             // Load full details including OrderItems
             var o = await _unitOfWork.Orders.GetOrderWithDetailsAsync(oStub.Id);
             if (o == null) continue; 
             
             // Delete messages for this order
             var orderMessages = await _unitOfWork.Messages.FindAsync(m => m.OrderId == o.Id);
             foreach(var m in orderMessages) await _unitOfWork.Messages.DeleteAsync(m);

             // Delete reviews for this order
             var orderReviews = await _unitOfWork.Reviews.FindAsync(r => r.OrderId == o.Id);
             foreach(var r in orderReviews) await _unitOfWork.Reviews.DeleteAsync(r);
             
             // NOW delete order (items cascade via EF if loaded, but we have strict orphan check too)
             await _unitOfWork.Orders.DeleteAsync(o);
        }

        // 2. Delete Products in this stall
        var products = await _unitOfWork.Products.FindAsync(p => p.StallId == s.Id);
        foreach(var p in products)
        {
            var prodReviews = await _unitOfWork.Reviews.FindAsync(r => r.ProductId == p.Id);
            foreach(var r in prodReviews) await _unitOfWork.Reviews.DeleteAsync(r);

            var relatedCartItems = await _unitOfWork.CartItems.FindAsync(ci => ci.ProductId == p.Id);
            foreach(var ci in relatedCartItems) await _unitOfWork.CartItems.DeleteAsync(ci);
            
            var relatedOrderItems = await _unitOfWork.OrderItems.FindAsync(oi => oi.ProductId == p.Id);
            foreach(var oi in relatedOrderItems)
            {
                await _unitOfWork.OrderItems.DeleteAsync(oi);
            }

            // --- DELETE PRODUCT IMAGE FILE ---
            if (!string.IsNullOrEmpty(p.ImageUrl))
            {
                DeleteFile(p.ImageUrl);
            }

            await _unitOfWork.Products.DeleteAsync(p);
        }

        // --- DELETE STALL LOGO & COVER ---
        if (!string.IsNullOrEmpty(s.LogoUrl)) DeleteFile(s.LogoUrl);
        if (!string.IsNullOrEmpty(s.CoverUrl)) DeleteFile(s.CoverUrl);

        await _unitOfWork.Stalls.DeleteAsync(s);
    }

    private void DeleteFile(string relativePath)
    {
        try 
        {
            if (string.IsNullOrWhiteSpace(relativePath)) return;
            
            // SECURITY: Validate path to prevent path traversal attacks
            var webRoot = _env.WebRootPath ?? "wwwroot";
            var fullPath = Path.GetFullPath(Path.Combine(webRoot, relativePath.TrimStart('/')));
            
            // Ensure the path is within WebRootPath
            if (!fullPath.StartsWith(Path.GetFullPath(webRoot), StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Path traversal attempt detected: {Path}", relativePath);
                return;
            }
            
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }
        }
        catch(Exception ex)
        {
            // Log error but don't fail the API call
            _logger.LogError(ex, "Failed to delete file {Path}", relativePath);
        }
    }

    [HttpPost("admins")]
    public async Task<IActionResult> AddAdmin([FromBody] AddAdminRequest request)
    {
        if (string.IsNullOrEmpty(request.Email))
            return BadRequest("Email is required");

        var users = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email);
        var user = users.FirstOrDefault();

        if (user == null)
            return NotFound("User not found");

        if (user.IsAdmin)
            return BadRequest("User is already an admin");

        user.IsAdmin = true;
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {Email} promoted to Admin by {AdminId}", user.Email, User.Identity?.Name);

        return Ok(new { message = "User promoted to admin" });
    }

    [HttpDelete("admins/{id}")]
    public async Task<IActionResult> RemoveAdmin(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        
        if (user == null)
            return NotFound("User not found");

        if (!string.IsNullOrEmpty(OwnerEmail) && user.Email == OwnerEmail)
            return BadRequest("Cannot remove the owner");

        user.IsAdmin = false;
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {Email} demoted from Admin by {AdminId}", user.Email, User.Identity?.Name);

        return Ok(new { message = "Admin rights revoked" });
    }
}

public class AddAdminRequest
{
    public required string Email { get; set; }
}
