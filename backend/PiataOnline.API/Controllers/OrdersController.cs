using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PiataOnline.Core.DTOs;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Enums;
using PiataOnline.Core.Interfaces;

namespace PiataOnline.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IUnitOfWork unitOfWork, ILogger<OrdersController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    private OrderDto MapToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            Status = order.Status.ToString(),
            TotalPrice = order.TotalPrice,
            CreatedAt = order.CreatedAt,
            UserId = order.UserId,
            StallId = order.StallId,
            StallName = order.Stall?.Name,
            Location = order.Location,
            PickupCode = order.PickupCode,
            Items = order.OrderItems?.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "",
                Quantity = i.Quantity,
                PriceAtPurchase = i.SubtotalPrice
            }).ToList() ?? new List<OrderItemDto>()
        };
    }

    private int? GetAuthenticatedUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    /// <summary>
    /// Get all orders for a user (buyer)
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersByUser(int userId)
    {
        try
        {
            // SECURITY: Verify user can only access their own orders (or admin)
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();
            
            if (authUserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            var orders = await _unitOfWork.Orders.GetOrdersByUserIdAsync(userId, 1, 50);
            return Ok(orders.Select(MapToDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving orders for user {UserId}", userId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get all orders for a stall (seller)
    /// </summary>
    [HttpGet("stall/{stallId}")]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersByStall(int stallId)
    {
        try
        {
            // SECURITY: Verify seller owns this stall (or admin)
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();

            var stall = await _unitOfWork.Stalls.GetByIdAsync(stallId);
            if (stall == null)
                return NotFound(new ErrorResponse { Message = "Stall not found" });
            
            if (stall.UserId != authUserId && !User.IsInRole("Admin"))
                return Forbid();

            var orders = await _unitOfWork.Orders.GetOrdersByStallIdAsync(stallId, 1, 50);
            return Ok(orders.Select(MapToDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving orders for stall {StallId}", stallId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get order by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        try
        {
            var order = await _unitOfWork.Orders.GetOrderWithDetailsAsync(id);
            if (order == null)
                return NotFound(new ErrorResponse { Message = "Order not found" });

            // SECURITY: Verify user is buyer OR stall owner (or admin)
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();
            
            var stall = await _unitOfWork.Stalls.GetByIdAsync(order.StallId);
            bool isOrderOwner = order.UserId == authUserId;
            bool isStallOwner = stall?.UserId == authUserId;
            
            if (!isOrderOwner && !isStallOwner && !User.IsInRole("Admin"))
                return Forbid();

            return Ok(MapToDto(order));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving order {OrderId}", id);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Create a new order
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            // Validate user exists
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                return BadRequest(new ErrorResponse { Message = "User not found" });

            // Validate stall exists
            var stall = await _unitOfWork.Stalls.GetByIdAsync(request.StallId);
            if (stall == null || !stall.IsActive)
                return BadRequest(new ErrorResponse { Message = "Stall not found" });

            // Calculate total and create order items
            var orderItems = new List<OrderItem>();
            int totalCents = 0;

            foreach (var item in request.Items)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
                if (product == null || product.DeletedAt != null)
                    return BadRequest(new ErrorResponse { Message = $"Product {item.ProductId} not found" });

                if (product.StallId != request.StallId)
                    return BadRequest(new ErrorResponse { Message = $"Product {item.ProductId} does not belong to this stall" });

                orderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    PriceCents = product.PriceCents,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });

                totalCents += product.PriceCents * item.Quantity;
            }

            // Validate minimum order value (5 RON = 500 cents)
            if (totalCents < 500)
                return BadRequest(new ErrorResponse { Message = "Minimum order value is 5 RON" });

            // Generate pickup code
            var pickupCode = GeneratePickupCode();

            var order = new Order
            {
                UserId = userId,
                StallId = request.StallId,
                Status = OrderStatus.NewOrder,
                TotalCents = totalCents,
                PickupCode = pickupCode,
                Location = request.Location,
                OrderItems = orderItems,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Orders.AddAsync(order);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Order {OrderId} created for user {UserId}", order.Id, userId);

            return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, MapToDto(order));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating order");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while creating the order" });
        }
    }

    /// <summary>
    /// Update order status (for seller)
    /// </summary>
    [HttpPut("{id}/status")]
    public async Task<ActionResult<OrderDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        try
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null)
                return NotFound(new ErrorResponse { Message = "Order not found" });

            if (!Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
                return BadRequest(new ErrorResponse { Message = "Invalid order status" });

            // Validate status transitions
            if (!IsValidStatusTransition(order.Status, newStatus))
                return BadRequest(new ErrorResponse { Message = $"Cannot transition from {order.Status} to {newStatus}" });

            order.Status = newStatus;
            order.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Orders.UpdateAsync(order);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Order {OrderId} status updated to {Status}", id, newStatus);

            return Ok(MapToDto(order));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating order status {OrderId}", id);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Cancel an order
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        try
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null)
                return NotFound(new ErrorResponse { Message = "Order not found" });

            if (order.Status != OrderStatus.NewOrder)
                return BadRequest(new ErrorResponse { Message = "Only new orders can be cancelled" });

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Orders.UpdateAsync(order);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Order {OrderId} cancelled", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling order {OrderId}", id);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get messages for an order (Frontend expected path)
    /// </summary>
    [HttpGet("{id}/messages")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForOrder(int id)
    {
        try
        {
            // SECURITY: Verify user authorization
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();

            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null)
                return NotFound(new ErrorResponse { Message = "Order not found" });

            // SECURITY: Verify user is buyer OR stall owner (or admin)
            var stall = await _unitOfWork.Stalls.GetByIdAsync(order.StallId);
            bool isOrderOwner = order.UserId == authUserId;
            bool isStallOwner = stall?.UserId == authUserId;
            
            if (!isOrderOwner && !isStallOwner && !User.IsInRole("Admin"))
                return Forbid();

            var messages = await _unitOfWork.Messages.GetByOrderIdAsync(id);
            var dtos = messages.Select(m => new MessageDto
            {
                Id = m.Id,
                Content = m.Content,
                OrderId = m.OrderId,
                UserId = m.UserId,
                UserName = m.User?.Name ?? "Utilizator",
                CreatedAt = m.CreatedAt
            });
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving messages for order {OrderId}", id);
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Send a message in an order chat (Frontend expected path)
    /// </summary>
    [HttpPost("{id}/messages")]
    public async Task<ActionResult<MessageDto>> SendMessageToOrder(int id, [FromBody] CreateMessageRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null) return NotFound();

            // SECURITY: Verify user is buyer OR stall owner (or admin)
            var stall = await _unitOfWork.Stalls.GetByIdAsync(order.StallId);
            
            bool isBuyer = order.UserId == userId;
            bool isSeller = stall?.UserId == userId;

            if (!isBuyer && !isSeller && !User.IsInRole("Admin"))
                return Forbid();

            var message = new Message
            {
                Content = request.Content,
                OrderId = id,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Messages.AddAsync(message);
            await _unitOfWork.SaveChangesAsync();

            var user = await _unitOfWork.Users.GetByIdAsync(userId);

            return Ok(new MessageDto
            {
                Id = message.Id,
                Content = message.Content,
                OrderId = message.OrderId,
                UserId = userId,
                UserName = user?.Name ?? "Eu",
                CreatedAt = message.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message to order {OrderId}", id);
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    private static string GeneratePickupCode()
    {
        // SECURITY: Use cryptographically secure random number generator
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var part1 = (BitConverter.ToUInt16(bytes, 0) % 9000) + 1000;
        var part2 = (BitConverter.ToUInt16(bytes, 2) % 9000) + 1000;
        return $"{part1}-{part2}";
    }

    private static bool IsValidStatusTransition(OrderStatus current, OrderStatus next)
    {
        // Valid transitions:
        // NewOrder -> Confirmed, Cancelled
        // Confirmed -> Completed, Cancelled
        return (current, next) switch
        {
            (OrderStatus.NewOrder, OrderStatus.Confirmed) => true,
            (OrderStatus.NewOrder, OrderStatus.Cancelled) => true,
            (OrderStatus.Confirmed, OrderStatus.Completed) => true,
            (OrderStatus.Confirmed, OrderStatus.Cancelled) => true,
            _ => false
        };
    }
}
