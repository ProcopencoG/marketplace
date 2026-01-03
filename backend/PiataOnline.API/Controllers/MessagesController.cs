using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PiataOnline.Core.DTOs;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;

namespace PiataOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(IUnitOfWork unitOfWork, ILogger<MessagesController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    private int? GetAuthenticatedUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    /// <summary>
    /// Get messages for an order
    /// </summary>
    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetOrderMessages(int orderId)
    {
        try
        {
            // SECURITY: Verify user has access to this order
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();

            var order = await _unitOfWork.Orders.GetByIdAsync(orderId);
            if (order == null)
                return NotFound(new ErrorResponse { Message = "Order not found" });

            // Check if user is order buyer or stall owner
            var stall = await _unitOfWork.Stalls.GetByIdAsync(order.StallId);
            bool isOrderOwner = order.UserId == authUserId;
            bool isStallOwner = stall?.UserId == authUserId;
            
            if (!isOrderOwner && !isStallOwner && !User.IsInRole("Admin"))
                return Forbid();

            var messages = await _unitOfWork.Messages.GetByOrderIdAsync(orderId);
            var dtos = messages.Select(m => new MessageDto
            {
                Id = m.Id,
                Content = m.Content,
                OrderId = m.OrderId,
                UserId = m.UserId,
                UserName = m.User?.Name ?? "",
                CreatedAt = m.CreatedAt
            });
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving messages for order {OrderId}", orderId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Send a message in an order chat
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] CreateMessageRequest request)
    {
        try
        {
            // SECURITY: Use authenticated user ID, not from request body
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();

            // Validate order exists
            var order = await _unitOfWork.Orders.GetByIdAsync(request.OrderId);
            if (order == null)
                return BadRequest(new ErrorResponse { Message = "Order not found" });

            // SECURITY: Verify user has access to this order
            var stall = await _unitOfWork.Stalls.GetByIdAsync(order.StallId);
            bool isOrderOwner = order.UserId == authUserId;
            bool isStallOwner = stall?.UserId == authUserId;
            
            if (!isOrderOwner && !isStallOwner && !User.IsInRole("Admin"))
                return Forbid();

            var user = await _unitOfWork.Users.GetByIdAsync(authUserId.Value);
            if (user == null)
                return BadRequest(new ErrorResponse { Message = "User not found" });

            var message = new Message
            {
                Content = request.Content,
                OrderId = request.OrderId,
                UserId = authUserId.Value, // Use authenticated user, not request body!
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Messages.AddAsync(message);
            await _unitOfWork.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrderMessages), new { orderId = message.OrderId }, new MessageDto
            {
                Id = message.Id,
                Content = message.Content,
                OrderId = message.OrderId,
                UserId = message.UserId,
                UserName = user.Name,
                CreatedAt = message.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while sending the message" });
        }
    }
}
