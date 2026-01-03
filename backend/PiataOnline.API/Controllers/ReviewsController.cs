using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PiataOnline.Core.DTOs;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;

namespace PiataOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ReviewsController> _logger;

    public ReviewsController(IUnitOfWork unitOfWork, ILogger<ReviewsController> logger)
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
    /// Get reviews for a product
    /// </summary>
    [HttpGet("product/{productId}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetProductReviews(int productId)
    {
        try
        {
            var reviews = await _unitOfWork.Reviews.GetByProductIdAsync(productId);
            var dtos = reviews.Select(r => new ReviewDto
            {
                Id = r.Id,
                Rating = r.Rating,
                Comment = r.Comment,
                ProductId = r.ProductId,
                UserId = r.UserId,
                UserName = r.User?.Name ?? "",
                CreatedAt = r.CreatedAt
            });
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving reviews for product {ProductId}", productId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get review by ID
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ReviewDto>> GetReviewById(int id)
    {
        try
        {
            var review = await _unitOfWork.Reviews.GetByIdAsync(id);
            if (review == null)
                return NotFound(new ErrorResponse { Message = "Review not found" });

            return Ok(new ReviewDto
            {
                Id = review.Id,
                Rating = review.Rating,
                Comment = review.Comment,
                ProductId = review.ProductId,
                UserId = review.UserId,
                CreatedAt = review.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving review {ReviewId}", id);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Create a new review
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] CreateReviewRequest request)
    {
        try
        {
            // SECURITY: Use authenticated user ID, not from request body
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();

            // Validate product exists
            var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId);
            if (product == null || product.DeletedAt != null)
                return BadRequest(new ErrorResponse { Message = "Product not found" });

            // Get user for review
            var user = await _unitOfWork.Users.GetByIdAsync(authUserId.Value);
            if (user == null)
                return BadRequest(new ErrorResponse { Message = "User not found" });

            var review = new Review
            {
                Rating = request.Rating,
                Comment = request.Comment,
                ProductId = request.ProductId,
                UserId = authUserId.Value, // Use authenticated user ID!
                OrderId = request.OrderId ?? 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Reviews.AddAsync(review);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Review {ReviewId} created for product {ProductId}", review.Id, request.ProductId);

            return CreatedAtAction(nameof(GetReviewById), new { id = review.Id }, new ReviewDto
            {
                Id = review.Id,
                Rating = review.Rating,
                Comment = review.Comment,
                ProductId = review.ProductId,
                UserId = review.UserId,
                CreatedAt = review.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating review");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while creating the review" });
        }
    }

    /// <summary>
    /// Delete a review
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        try
        {
            // SECURITY: Verify user owns this review
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();

            var review = await _unitOfWork.Reviews.GetByIdAsync(id);
            if (review == null)
                return NotFound(new ErrorResponse { Message = "Review not found" });

            // Only owner or admin can delete
            if (review.UserId != authUserId && !User.IsInRole("Admin"))
                return Forbid();

            await _unitOfWork.Reviews.DeleteAsync(review);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting review {ReviewId}", id);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get average rating for a product
    /// </summary>
    [HttpGet("product/{productId}/rating")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> GetProductRating(int productId)
    {
        try
        {
            var rating = await _unitOfWork.Products.CalculateAverageRatingAsync(productId);
            var reviews = await _unitOfWork.Reviews.GetByProductIdAsync(productId);
            
            return Ok(new { Rating = rating, ReviewsCount = reviews.Count() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating rating for product {ProductId}", productId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }
}
