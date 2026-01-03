using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PiataOnline.Core.DTOs;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;

namespace PiataOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CartsController> _logger;

    public CartsController(IUnitOfWork unitOfWork, ILogger<CartsController> logger)
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
    /// Get user's cart
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<CartDto>> GetUserCart(int userId)
    {
        try
        {
            // SECURITY: Verify user can only access their own cart
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();
            
            if (authUserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            var cart = await _unitOfWork.Carts.GetCartWithItemsAsync(userId);
            if (cart == null)
            {
                // Return empty cart
                return Ok(new CartDto
                {
                    UserId = userId,
                    Items = new List<CartItemDto>(),
                    TotalPrice = 0
                });
            }

            var items = cart.CartItems?.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "",
                ProductPrice = (i.Product?.PriceCents ?? 0) / 100m,
                Quantity = i.Quantity,
                StallId = i.Product?.StallId ?? 0,
                ImageUrl = i.Product?.ImageUrl
            }).ToList() ?? new List<CartItemDto>();

            return Ok(new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId ?? 0,
                Items = items,
                TotalPrice = items.Sum(i => i.ProductPrice * i.Quantity)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving cart for user {UserId}", userId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Add item to cart
    /// </summary>
    [HttpPost("user/{userId}/items")]
    public async Task<ActionResult<CartDto>> AddToCart(int userId, [FromBody] AddToCartRequest request)
    {
        try
        {
            // SECURITY: Verify user can only modify their own cart
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();
            if (authUserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            // Validate product exists
            var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId);
            if (product == null || product.DeletedAt != null)
                return BadRequest(new ErrorResponse { Message = "Product not found" });

            // Get or create cart
            var cart = await _unitOfWork.Carts.GetCartWithItemsAsync(userId);
            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Carts.AddAsync(cart);
                await _unitOfWork.SaveChangesAsync();
            }

            // Check if item already in cart
            var existingItem = cart.CartItems?.FirstOrDefault(i => i.ProductId == request.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
                existingItem.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _unitOfWork.CartItems.AddAsync(cartItem);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync();

            // Return updated cart
            return await GetUserCart(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding to cart for user {UserId}", userId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Update cart item quantity
    /// </summary>
    [HttpPut("user/{userId}/items/{itemId}")]
    public async Task<ActionResult<CartDto>> UpdateCartItem(int userId, int itemId, [FromBody] UpdateCartItemRequest request)
    {
        try
        {
            // SECURITY: Verify user can only modify their own cart
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();
            if (authUserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            var cartItem = await _unitOfWork.CartItems.GetByIdAsync(itemId);
            if (cartItem == null)
                return NotFound(new ErrorResponse { Message = "Cart item not found" });

            if (request.Quantity <= 0)
            {
                await _unitOfWork.CartItems.DeleteAsync(cartItem);
            }
            else
            {
                cartItem.Quantity = request.Quantity;
                cartItem.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.CartItems.UpdateAsync(cartItem);
            }

            await _unitOfWork.SaveChangesAsync();

            return await GetUserCart(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cart item {ItemId}", itemId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Remove item from cart
    /// </summary>
    [HttpDelete("user/{userId}/items/{itemId}")]
    public async Task<IActionResult> RemoveFromCart(int userId, int itemId)
    {
        try
        {
            // SECURITY: Verify user can only modify their own cart
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();
            if (authUserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            var cartItem = await _unitOfWork.CartItems.GetByIdAsync(itemId);
            if (cartItem == null)
                return NotFound(new ErrorResponse { Message = "Cart item not found" });

            await _unitOfWork.CartItems.DeleteAsync(cartItem);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cart item {ItemId}", itemId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Clear user's cart
    /// </summary>
    [HttpDelete("user/{userId}")]
    public async Task<IActionResult> ClearCart(int userId)
    {
        try
        {
            // SECURITY: Verify user can only clear their own cart
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();
            if (authUserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            var cart = await _unitOfWork.Carts.GetCartWithItemsAsync(userId);
            if (cart == null)
                return NoContent();

            if (cart.CartItems != null)
            {
                foreach (var item in cart.CartItems.ToList())
                {
                    await _unitOfWork.CartItems.DeleteAsync(item);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cart for user {UserId}", userId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }
}
