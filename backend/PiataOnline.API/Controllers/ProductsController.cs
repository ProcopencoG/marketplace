using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PiataOnline.Core.DTOs;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Enums;
using PiataOnline.Core.Interfaces;

namespace PiataOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IUnitOfWork unitOfWork, ILogger<ProductsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    private int? GetAuthenticatedUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        Unit = p.Unit.ToString(),
        Category = p.Category.ToString(),
        StockType = p.StockType.ToString(),
        StockQuantity = p.StockQuantity,
        ImageUrl = p.ImageUrl,
        StallId = p.StallId
    };

    /// <summary>
    /// Get all products
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProducts()
    {
        try
        {
            var products = await _unitOfWork.Products.GetActiveProductsAsync();
            return Ok(products.Select(MapToDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving products");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get products by stall
    /// </summary>
    [HttpGet("stall/{stallId}")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsByStall(int stallId)
    {
        try
        {
            var products = await _unitOfWork.Products.GetProductsByStallAsync(stallId);
            return Ok(products.Select(MapToDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving products for stall: {StallId}", stallId);
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get product by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProductById(int id)
    {
        try
        {
            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null || product.DeletedAt != null)
                return NotFound(new { message = "Product not found" });

            return Ok(MapToDto(product));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving product: {ProductId}", id);
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Create a new product
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductRequest request)
    {
        try
        {
            // Verify stall exists
            var stall = await _unitOfWork.Stalls.GetByIdAsync(request.StallId);
            if (stall == null || !stall.IsActive)
                return BadRequest(new { message = "Stall not found" });

            // SECURITY: Verify user owns the stall
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();
            if (stall.UserId != authUserId && !User.IsInRole("Admin"))
                return Forbid();

            // Parse enums (use Romanian values from enum definitions)
            if (!Enum.TryParse<Unit>(request.MeasureUnit, true, out var unit))
                unit = Unit.Bucată;
            if (!Enum.TryParse<ProductCategory>(request.Category, true, out var category))
                category = ProductCategory.Altele;
            if (!Enum.TryParse<StockType>(request.StockType, true, out var stockType))
                stockType = StockType.InStock;

            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                PriceCents = request.PriceCents,
                Unit = unit,
                Category = category,
                StockType = stockType,
                StockQuantity = request.StockQuantity,
                ImageUrl = request.ImageUrl,
                StallId = request.StallId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Products.AddAsync(product);
            await _unitOfWork.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, MapToDto(product));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product");
            return StatusCode(500, new { message = "An error occurred while creating the product" });
        }
    }

    /// <summary>
    /// Update an existing product
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
    {
        try
        {
            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null || product.DeletedAt != null)
                return NotFound(new { message = "Product not found" });

            // SECURITY: Verify user owns the product's stall
            var stall = await _unitOfWork.Stalls.GetByIdAsync(product.StallId);
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();
            if (stall?.UserId != authUserId && !User.IsInRole("Admin"))
                return Forbid();

            // Parse enums (use Romanian values from enum definitions)
            if (!Enum.TryParse<Unit>(request.MeasureUnit, true, out var unit))
                unit = Unit.Bucată;
            if (!Enum.TryParse<ProductCategory>(request.Category, true, out var category))
                category = ProductCategory.Altele;
            if (!Enum.TryParse<StockType>(request.StockType, true, out var stockType))
                stockType = StockType.InStock;

            product.Name = request.Name;
            product.Description = request.Description;
            product.PriceCents = request.PriceCents;
            product.Unit = unit;
            product.Category = category;
            product.StockType = stockType;
            product.StockQuantity = request.StockQuantity;
            product.ImageUrl = request.ImageUrl;
            product.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Products.UpdateAsync(product);
            await _unitOfWork.SaveChangesAsync();

            return Ok(MapToDto(product));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product: {ProductId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the product" });
        }
    }

    /// <summary>
    /// Delete a product (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        try
        {
            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null || product.DeletedAt != null)
                return NotFound(new { message = "Product not found" });

            // SECURITY: Verify user owns the product's stall
            var stall = await _unitOfWork.Stalls.GetByIdAsync(product.StallId);
            var authUserId = GetAuthenticatedUserId();
            if (authUserId == null)
                return Unauthorized();
            if (stall?.UserId != authUserId && !User.IsInRole("Admin"))
                return Forbid();

            // Soft delete
            await _unitOfWork.Products.SoftDeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting product: {ProductId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the product" });
        }
    }
}
