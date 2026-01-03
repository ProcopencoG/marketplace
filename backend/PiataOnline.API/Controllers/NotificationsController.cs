using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;
using System.Security.Claims;

namespace PiataOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(IUnitOfWork unitOfWork, ILogger<NotificationsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(new { message = "User not found" });
        }

        var notifications = await _unitOfWork.Notifications.FindAsync(n => n.RecipientId == userId);
        
        // Sorting and limiting should be done in DB ideally, but for now in memory
        var recentNotifications = notifications
            .OrderByDescending(n => n.CreatedAt)
            .Take(20)
            .Select(n => new 
            {
                id = n.Id,
                type = n.Type,
                @params = System.Text.Json.JsonSerializer.Deserialize<object>(n.Params), // Deserialize JSON string params
                read_at = n.ReadAt,
                time_ago = GetTimeAgo(n.CreatedAt)
            });

        return Ok(new 
        {
            notifications = recentNotifications,
            unread_count = notifications.Count(n => n.ReadAt == null)
        });
    }

    [HttpPost("{id}/mark_as_read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var notification = await _unitOfWork.Notifications.GetByIdAsync(id);
        if (notification == null) return NotFound("Notification not found");

        if (notification.RecipientId != userId) return Forbid();

        notification.ReadAt = DateTime.UtcNow;
        notification.UpdatedAt = DateTime.UtcNow;
        
        await _unitOfWork.Notifications.UpdateAsync(notification);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Marked as read" });
    }

    [HttpPost("mark_all_as_read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var notifications = await _unitOfWork.Notifications.FindAsync(n => n.RecipientId == userId && n.ReadAt == null);
        
        foreach (var n in notifications)
        {
            n.ReadAt = DateTime.UtcNow;
            n.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Notifications.UpdateAsync(n);
        }
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "All marked as read" });
    }

    private string GetTimeAgo(DateTime date)
    {
        var span = DateTime.UtcNow - date;
        if (span.TotalMinutes < 1) return "chiar acum";
        if (span.TotalMinutes < 60) return $"{span.TotalMinutes:0} min în urmă";
        if (span.TotalHours < 24) return $"{span.TotalHours:0} ore în urmă";
        return $"{span.TotalDays:0} zile în urmă";
    }
}
