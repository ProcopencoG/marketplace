using Microsoft.AspNetCore.Mvc;
using PiataOnline.Core.DTOs;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Enums;
using PiataOnline.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace PiataOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StallsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<StallsController> _logger;
    private readonly IWebHostEnvironment _env;

    public StallsController(IUnitOfWork unitOfWork, ILogger<StallsController> logger, IWebHostEnvironment env)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _env = env;
    }

    // Maps stall to DTO with calculated rating (DRY: rating comes from reviews, not stored field)
    private async Task<StallDto> MapToDtoAsync(Stall s)
    {
        var rating = await _unitOfWork.Stalls.CalculateAverageRatingAsync(s.Id);
        var reviewsCount = await _unitOfWork.Stalls.GetReviewsCountAsync(s.Id);
        
        return new StallDto
        {
            Id = s.Id,
            Name = s.Name,
            Description = s.Description,
            Location = s.Location,
            LogoUrl = s.LogoUrl,
            CoverUrl = s.CoverUrl,
            Status = s.Status.ToString(),
            Rating = rating,
            ReviewsCount = reviewsCount
        };
    }

    /// <summary>
    /// Get all active stalls
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StallDto>>> GetAllStalls()
    {
        try
        {
            var stalls = await _unitOfWork.Stalls.GetAllAsync();
            var activeStalls = stalls.Where(s => s.IsActive).ToList();
            
            // Batch fetch ratings and review counts to avoid N+1 queries
            var stallIds = activeStalls.Select(s => s.Id).ToList();
            var ratingsMap = await _unitOfWork.Stalls.GetAverageRatingsAsync(stallIds);
            var reviewCountsMap = await _unitOfWork.Stalls.GetReviewCountsAsync(stallIds);
            
            var dtos = activeStalls.Select(s => new StallDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Location = s.Location,
                LogoUrl = s.LogoUrl,
                CoverUrl = s.CoverUrl,
                Status = s.Status.ToString(),
                Rating = ratingsMap.GetValueOrDefault(s.Id, 0),
                ReviewsCount = reviewCountsMap.GetValueOrDefault(s.Id, 0)
            });
            
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stalls");
            return StatusCode(500, new { message = "An error occurred while retrieving stalls" });
        }
    }

    /// <summary>
    /// Get stalls by location
    /// </summary>
    [HttpGet("location/{location}")]
    public async Task<ActionResult<IEnumerable<StallDto>>> GetStallsByLocation(string location)
    {
        try
        {
            var stalls = (await _unitOfWork.Stalls.GetActiveStallsByLocationAsync(location)).ToList();
            
            // Batch fetch ratings and review counts
            var stallIds = stalls.Select(s => s.Id).ToList();
            var ratingsMap = await _unitOfWork.Stalls.GetAverageRatingsAsync(stallIds);
            var reviewCountsMap = await _unitOfWork.Stalls.GetReviewCountsAsync(stallIds);
            
            var dtos = stalls.Select(s => new StallDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Location = s.Location,
                LogoUrl = s.LogoUrl,
                CoverUrl = s.CoverUrl,
                Status = s.Status.ToString(),
                Rating = ratingsMap.GetValueOrDefault(s.Id, 0),
                ReviewsCount = reviewCountsMap.GetValueOrDefault(s.Id, 0)
            });
            
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stalls by location: {Location}", location);
            return StatusCode(500, new { message = "An error occurred while retrieving stalls" });
        }
    }

    /// <summary>
    /// Get stall by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetStallById(int id, [FromQuery] string? search, [FromQuery] string? category)
    {
        try
        {
            var stall = await _unitOfWork.Stalls.GetByIdAsync(id);
            if (stall == null || !stall.IsActive)
                return NotFound(new { message = "Stall not found" });

            var stallDto = await MapToDtoAsync(stall);
            var products = await _unitOfWork.Products.GetProductsByStallAsync(id); // Fixed: IdAsync -> Async

            // Filter products
            if (!string.IsNullOrWhiteSpace(search))
            {
                products = products.Where(p => p.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
            }
            if (!string.IsNullOrWhiteSpace(category) && category != "All")
            {
                // Category is likely an enum, compare string representation
                products = products.Where(p => p.Category.ToString().Equals(category, StringComparison.OrdinalIgnoreCase));
            }

            // Return composed object matching frontend expectations
            return Ok(new 
            {
                stall = stallDto,
                products = products.Select(p => new 
                {
                    id = p.Id,
                    name = p.Name,
                    description = p.Description,
                    price = p.Price,
                    priceCents = p.PriceCents,
                    unit = p.Unit.ToString(),
                    imageUrl = p.ImageUrl,
                    category = p.Category.ToString(),
                    stallId = p.StallId,
                    inStock = p.StockType != PiataOnline.Core.Enums.StockType.OutOfStock && 
                               (p.StockType != PiataOnline.Core.Enums.StockType.Limited || (p.StockQuantity ?? 0) > 0)
                })
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stall: {StallId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the stall" });
        }
    }

    /// <summary>
    /// Search stalls by name
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<StallDto>>> SearchStalls([FromQuery] string query)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Search query cannot be empty" });

            var stalls = (await _unitOfWork.Stalls.SearchStallsByNameAsync(query)).ToList();
            
            // Batch fetch ratings and review counts
            var stallIds = stalls.Select(s => s.Id).ToList();
            var ratingsMap = await _unitOfWork.Stalls.GetAverageRatingsAsync(stallIds);
            var reviewCountsMap = await _unitOfWork.Stalls.GetReviewCountsAsync(stallIds);
            
            var dtos = stalls.Select(s => new StallDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Location = s.Location,
                LogoUrl = s.LogoUrl,
                CoverUrl = s.CoverUrl,
                Status = s.Status.ToString(),
                Rating = ratingsMap.GetValueOrDefault(s.Id, 0),
                ReviewsCount = reviewCountsMap.GetValueOrDefault(s.Id, 0)
            });
            
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching stalls with query: {Query}", query);
            return StatusCode(500, new { message = "An error occurred while searching stalls" });
        }
    }

    /// <summary>
    /// Create a new stall
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<StallDto>> CreateStall([FromBody] CreateStallRequest request)
    {
        try
        {
            // SECURITY: Use authenticated user ID, not from request body
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            // Verify user exists
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                return BadRequest(new { message = "User not found" });

            // Check if user already has a stall
            var existingStall = await _unitOfWork.Stalls.GetByUserIdAsync(userId);
            if (existingStall != null)
                return BadRequest(new { message = "Ai deja o tarabă configurată. Poți avea doar una singură." });

            var stall = new Stall
            {
                Name = request.Name,
                Description = request.Description,
                Location = request.Location,
                LogoUrl = request.LogoUrl,
                CoverUrl = request.CoverUrl,
                UserId = userId, // Use authenticated user ID!
                // Environment-aware approval: auto-approve in dev, require review in production
                Status = _env.IsDevelopment() ? StallStatus.Approved : StallStatus.Pending,
                // Rating and ReviewsCount are calculated from reviews (DRY)
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Stalls.AddAsync(stall);
            await _unitOfWork.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStallById), new { id = stall.Id }, await MapToDtoAsync(stall));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating stall");
            return StatusCode(500, new { message = "An error occurred while creating the stall" });
        }
    }

    /// <summary>
    /// Update an existing stall
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<StallDto>> UpdateStall(int id, [FromBody] UpdateStallRequest request)
    {
        try
        {
            // SECURITY: Verify user owns this stall
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authUserId))
                return Unauthorized();

            var stall = await _unitOfWork.Stalls.GetByIdAsync(id);
            if (stall == null || !stall.IsActive)
                return NotFound(new { message = "Stall not found" });

            // Only owner or admin can update
            if (stall.UserId != authUserId && !User.IsInRole("Admin"))
                return Forbid();

            stall.Name = request.Name;
            stall.Description = request.Description;
            stall.Location = request.Location;
            stall.LogoUrl = request.LogoUrl;
            stall.CoverUrl = request.CoverUrl;
            stall.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Stalls.UpdateAsync(stall);
            await _unitOfWork.SaveChangesAsync();

            return Ok(await MapToDtoAsync(stall));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating stall: {StallId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the stall" });
        }
    }

    /// <summary>
    /// Delete a stall (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteStall(int id)
    {
        try
        {
            // SECURITY: Verify user owns this stall
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authUserId))
                return Unauthorized();

            var stall = await _unitOfWork.Stalls.GetByIdAsync(id);
            if (stall == null || !stall.IsActive)
                return NotFound(new { message = "Stall not found" });

            // Only owner or admin can delete
            if (stall.UserId != authUserId && !User.IsInRole("Admin"))
                return Forbid();

            // Soft delete
            stall.DeletedAt = DateTime.UtcNow;
            stall.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Stalls.UpdateAsync(stall);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting stall: {StallId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the stall" });
        }
    }
}
