using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PiataOnline.Core.DTOs;
using PiataOnline.Core.Interfaces;
using PiataOnline.Core.Enums;
using System.Security.Claims;

namespace PiataOnline.API.Controllers;

[Authorize]
[ApiController]
[Route("api/seller")]
public class SellerController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<SellerController> _logger;

    public SellerController(IUnitOfWork unitOfWork, IWebHostEnvironment environment, ILogger<SellerController> logger)
    {
        _unitOfWork = unitOfWork;
        _environment = environment;
        _logger = logger;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<SellerDashboardDto>> GetDashboard()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        // 1. Get the seller's stall
        var stall = await _unitOfWork.Stalls.GetByUserIdAsync(userId);
        if (stall == null)
        {
            return NotFound(new { message = "Nu ai o tarabă configurată." });
        }

        // 2. Get products for this stall
        var products = await _unitOfWork.Products.GetByStallIdAsync(stall.Id);

        // 3. Get orders for this stall to calculate metrics
        var orders = await _unitOfWork.Orders.GetByStallIdAsync(stall.Id);

        // 4. Calculate metrics
        var totalSales = orders.Where(o => o.Status != PiataOnline.Core.Enums.OrderStatus.Cancelled)
                              .Sum(o => o.TotalCents) / 100m;
        
        var ordersCount = orders.Count();
        var avgOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;

        // 5. Recent orders (top 5)
        var recentOrders = orders.OrderByDescending(o => o.CreatedAt)
                                .Take(5)
                                .Select(o => new RecentOrderDto
                                {
                                    Id = o.Id,
                                    BuyerName = o.User?.Name ?? "Client Anonim",
                                    Date = o.CreatedAt.ToString("dd MMM yyyy"),
                                    Total = o.TotalCents / 100m,
                                    Status = o.Status.ToString().ToLower()
                                }).ToList();

        // 6. Mock chart data (30 days) - in real app this would be grouped by date from DB
        var chartData = GenerateMockChartData(orders);

        var result = new SellerDashboardDto
        {
            Stall = stall.Adapt<StallDto>(),
            Products = products.Adapt<List<ProductDto>>(),
            Metrics = new SellerMetricsDto
            {
                TotalSales = totalSales,
                OrdersCount = ordersCount,
                AvgOrderValue = Math.Round(avgOrderValue, 2)
            },
            RecentOrders = recentOrders,
            ChartData = chartData
        };

        return Ok(result);
    }

    [HttpPatch("stall")]
    public async Task<ActionResult> UpdateStall([FromForm] UpdateSellerStallRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        var stall = await _unitOfWork.Stalls.GetByUserIdAsync(userId);
        if (stall == null)
        {
            return NotFound(new { message = "Nu ai o tarabă configurată." });
        }

        // Update basic properties
        stall.Name = request.Name;
        stall.Description = request.Description;
        stall.Location = request.Location;
        stall.UpdatedAt = DateTime.UtcNow;

        // Handle file uploads
        if (request.Logo != null)
        {
            stall.LogoUrl = await SaveFileAsync(request.Logo, "logos");
        }

        if (request.Cover != null)
        {
            stall.CoverUrl = await SaveFileAsync(request.Cover, "covers");
        }

        await _unitOfWork.Stalls.UpdateAsync(stall);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Profil actualizat cu succes!" });
    }

    [HttpPost("products")]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromForm] SellerProductRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        var stall = await _unitOfWork.Stalls.GetByUserIdAsync(userId);
        if (stall == null)
        {
            return NotFound(new { message = "Nu ai o tarabă configurată." });
        }

        var product = new PiataOnline.Core.Entities.Product
        {
            Name = request.Name,
            Description = request.Description,
            PriceCents = (int)(request.Price * 100),
            Unit = ParseUnit(request.Unit),
            Category = ParseCategory(request.Category),
            StockType = ParseStockType(request.StockType),
            StockQuantity = request.StockQuantity,
            StallId = stall.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.Image != null)
        {
            product.ImageUrl = await SaveFileAsync(request.Image, "products");
        }

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return Ok(product.Adapt<ProductDto>());
    }

    [HttpPut("products/{id}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromForm] SellerProductRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null || product.DeletedAt != null)
        {
            return NotFound();
        }

        // Verify ownership
        var stall = await _unitOfWork.Stalls.GetByUserIdAsync(userId);
        if (stall == null || product.StallId != stall.Id)
        {
            return Forbid();
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.PriceCents = (int)(request.Price * 100);
        product.Unit = ParseUnit(request.Unit);
        product.Category = ParseCategory(request.Category);
        product.StockType = ParseStockType(request.StockType);
        product.StockQuantity = request.StockQuantity;
        product.UpdatedAt = DateTime.UtcNow;

        if (request.Image != null)
        {
            product.ImageUrl = await SaveFileAsync(request.Image, "products");
        }

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return Ok(product.Adapt<ProductDto>());
    }

    [HttpDelete("products/{id}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null || product.DeletedAt != null)
        {
            return NotFound();
        }

        // Verify ownership
        var stall = await _unitOfWork.Stalls.GetByUserIdAsync(userId);
        if (stall == null || product.StallId != stall.Id)
        {
            return Forbid();
        }

        await _unitOfWork.Products.SoftDeleteAsync(id);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("orders")]
    public async Task<ActionResult<IEnumerable<object>>> GetSellerOrders()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        var stall = await _unitOfWork.Stalls.GetByUserIdAsync(userId);
        if (stall == null)
        {
            return NotFound(new { message = "Nu ai o tarabă configurată." });
        }

        var orders = await _unitOfWork.Orders.GetByStallIdAsync(stall.Id);
        
        var result = orders.Select(o => new 
        {
            Id = o.Id,
            BuyerName = o.User?.Name ?? "Client Anonim",
            Location = o.Location,
            CreatedAt = o.CreatedAt,
            TotalPrice = o.TotalCents / 100m,
            Status = o.Status.ToString(),
            ItemCount = o.OrderItems?.Count ?? 0
        });

        return Ok(result);
    }

    [HttpGet("orders/{id}")]
    public async Task<ActionResult<object>> GetSellerOrderDetails(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        var order = await _unitOfWork.Orders.GetOrderWithDetailsAsync(id);
        if (order == null) return NotFound();

        // Verify ownership
        var stall = await _unitOfWork.Stalls.GetByUserIdAsync(userId);
        if (stall == null || order.StallId != stall.Id) return Forbid();

        var result = new
        {
            Id = order.Id,
            Status = order.Status.ToString(),
            CreatedAt = order.CreatedAt,
            TotalPrice = order.TotalCents / 100m,
            Location = order.Location,
            Buyer = new { Name = order.User?.Name, Location = order.User?.Location },
            Items = order.OrderItems?.Select(i => new 
            {
                Id = i.Id,
                ProductName = i.Product?.Name ?? "Produs Șters",
                Quantity = i.Quantity,
                PriceAtPurchase = i.PriceCents / 100m,
                Subtotal = (i.PriceCents * i.Quantity) / 100m
            }).ToList()
        };

        return Ok(result);
    }

    [HttpPatch("orders/{id}")]
    public async Task<ActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        var order = await _unitOfWork.Orders.GetByIdAsync(id);
        if (order == null) return NotFound();

        // Verify ownership
        var stall = await _unitOfWork.Stalls.GetByUserIdAsync(userId);
        if (stall == null || order.StallId != stall.Id) return Forbid();

        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
            return BadRequest(new { message = "Status invalid" });

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Orders.UpdateAsync(order);
        await _unitOfWork.SaveChangesAsync();

        return Ok();
    }

    private Unit ParseUnit(string unit)
    {
        return unit.ToLower() switch
        {
            "kg" => Unit.Kg,
            "bucată" => Unit.Bucată,
            "100g" => Unit.Grams100,
            "borcan" => Unit.Borcan,
            "litru" => Unit.Litru,
            _ => Unit.Kg
        };
    }

    private ProductCategory ParseCategory(string category)
    {
        if (Enum.TryParse<ProductCategory>(category, true, out var result))
            return result;
        return ProductCategory.Altele;
    }

    private StockType ParseStockType(string stockType)
    {
        return stockType.ToLower() switch
        {
            "in_stock" => StockType.InStock,
            "limited" => StockType.Limited,
            "one_piece" => StockType.OnePiece,
            "out_of_stock" => StockType.OutOfStock,
            _ => StockType.InStock
        };
    }

    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private static readonly string[] AllowedContentTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    private async Task<string?> SaveFileAsync(IFormFile file, string folder)
    {
        // SECURITY: Validate file
        if (file == null || file.Length == 0)
            return null;

        // Check file size (max 5MB)
        if (file.Length > MaxFileSize)
        {
            _logger.LogWarning("File upload rejected: size {Size} exceeds limit", file.Length);
            throw new InvalidOperationException("Fișierul este prea mare. Dimensiunea maximă: 5MB");
        }

        // Check extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
        {
            _logger.LogWarning("File upload rejected: invalid extension {Extension}", extension);
            throw new InvalidOperationException("Tip de fișier invalid. Sunt permise doar: JPG, PNG, GIF, WEBP");
        }

        // Check content type
        if (!AllowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            _logger.LogWarning("File upload rejected: invalid content type {ContentType}", file.ContentType);
            throw new InvalidOperationException("Tip de fișier invalid");
        }

        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? "wwwroot", "uploads", folder);
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        // SECURITY: Use GUID only, no original filename to prevent path traversal
        var safeFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, safeFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        // Return the relative URL
        return $"/uploads/{folder}/{safeFileName}";
    }

    private List<DashboardChartPointDto> GenerateMockChartData(IEnumerable<PiataOnline.Core.Entities.Order> orders)
    {
        var data = new List<DashboardChartPointDto>();
        var now = DateTime.UtcNow;

        for (int i = 29; i >= 0; i--)
        {
            var date = now.AddDays(-i);
            var dateStr = date.ToString("dd/MM");
            
            var dailyTotal = orders
                .Where(o => o.CreatedAt.Date == date.Date && o.Status != PiataOnline.Core.Enums.OrderStatus.Cancelled)
                .Sum(o => o.TotalCents) / 100m;

            data.Add(new DashboardChartPointDto
            {
                Date = dateStr,
                Sales = dailyTotal
            });
        }

        return data;
    }
}
