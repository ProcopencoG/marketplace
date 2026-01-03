using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace PiataOnline.Core.DTOs;

// ===================== Response DTOs =====================

public record StallDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public string? LogoUrl { get; init; }
    public string? CoverUrl { get; init; }
    public string Status { get; init; } = string.Empty;
    public double Rating { get; init; }
    public int ReviewsCount { get; init; }
    public int UserId { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record ProductDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string Unit { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string StockType { get; init; } = string.Empty;
    public int? StockQuantity { get; init; }
    public string? ImageUrl { get; init; }
    public int StallId { get; init; }
    public double Rating { get; init; }
    public int ReviewsCount { get; init; }
}

public record OrderDto
{
    public int Id { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal TotalPrice { get; init; }
    public DateTime CreatedAt { get; init; }
    public int UserId { get; init; }
    public int StallId { get; init; }
    public string? StallName { get; init; }
    public string? Location { get; init; }
    public string? PickupCode { get; init; }
    public List<OrderItemDto> Items { get; init; } = new();
}

public record OrderItemDto
{
    public int Id { get; init; }
    public int ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal PriceAtPurchase { get; init; }
}

public record UserDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Location { get; init; }
    public bool IsAdmin { get; init; }
    public bool HasStall { get; init; }
    public int? StallId { get; init; }
    public string? AvatarUrl { get; init; }
}

public record ReviewDto
{
    public int Id { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
    public int ProductId { get; init; }
    public int UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public record MessageDto
{
    public int Id { get; init; }
    public string Content { get; init; } = string.Empty;
    public int OrderId { get; init; }
    public int UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public record CartDto
{
    public int Id { get; init; }
    public int UserId { get; init; }
    public List<CartItemDto> Items { get; init; } = new();
    public decimal TotalPrice { get; init; }
}

public record CartItemDto
{
    public int Id { get; init; }
    public int ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public decimal ProductPrice { get; init; }
    public int Quantity { get; init; }
    public int StallId { get; init; }
    public string? ImageUrl { get; init; }
}

public record NotificationDto
{
    public int Id { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Params { get; init; } = "{}";
    public bool IsRead { get; init; }
    public DateTime CreatedAt { get; init; }
}

// ===================== Pagination =====================

public record PaginatedResponse<T>
{
    public List<T> Items { get; init; } = new();
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}

// ===================== Auth DTOs =====================

public record LoginRequest
{
    public string Provider { get; init; } = "google";
    public string IdToken { get; init; } = string.Empty;
}

public record LoginResponse
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
    public UserDto User { get; init; } = null!;
}

public record RefreshTokenRequest
{
    public string RefreshToken { get; init; } = string.Empty;
}

// ===================== Request DTOs (Create/Update) =====================

public record CreateUserRequest
{
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Provider { get; init; } = "google";
    public string Uid { get; init; } = string.Empty;
    public string? Location { get; init; }
    public string? AvatarUrl { get; init; }
}

public record CreateStallRequest
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public string? LogoUrl { get; init; }
    public string? CoverUrl { get; init; }
    public int UserId { get; init; }
}

public record UpdateStallRequest
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public string? LogoUrl { get; init; }
    public string? CoverUrl { get; init; }
}

public class UpdateSellerStallRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public IFormFile? Logo { get; set; }
    public IFormFile? Cover { get; set; }
}

public record CreateProductRequest
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int PriceCents { get; init; }
    public string MeasureUnit { get; init; } = "Bucată";
    public string Category { get; init; } = "Altele";
    public string StockType { get; init; } = "InStock";
    public int? StockQuantity { get; init; }
    public string? ImageUrl { get; init; }
    public int StallId { get; init; }
}

public record UpdateProductRequest
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int PriceCents { get; init; }
    public string MeasureUnit { get; init; } = "Bucată";
    public string Category { get; init; } = "Altele";
    public string StockType { get; init; } = "InStock";
    public int? StockQuantity { get; init; }
    public string? ImageUrl { get; init; }
}

public class SellerProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Unit { get; set; } = "kg";
    public string Category { get; set; } = "Legume";
    public string StockType { get; set; } = "in_stock";
    public int? StockQuantity { get; set; }
    public IFormFile? Image { get; set; }
    public int StallId { get; set; }
}

public record CreateOrderRequest
{
    public int StallId { get; init; }
    public string? Location { get; init; }
    public List<OrderItemRequest> Items { get; init; } = new();
}

public record OrderItemRequest
{
    public int ProductId { get; init; }
    public int Quantity { get; init; }
}

public record UpdateOrderStatusRequest
{
    public string Status { get; init; } = string.Empty;
}

public record CreateReviewRequest
{
    public int Rating { get; init; }
    public string? Comment { get; init; }
    public int ProductId { get; init; }
    public int UserId { get; init; }
    public int? OrderId { get; init; }
}

public record CreateMessageRequest
{
    public string Content { get; init; } = string.Empty;
    public int OrderId { get; init; }
    public int UserId { get; init; }
}

public record AddToCartRequest
{
    public int ProductId { get; init; }
    public int Quantity { get; init; } = 1;
}

public record UpdateCartItemRequest
{
    public int Quantity { get; init; }
}

// ===================== Dashboard DTOs =====================

public record SellerDashboardDto
{
    public StallDto Stall { get; init; } = null!;
    public List<ProductDto> Products { get; init; } = new();
    public SellerMetricsDto Metrics { get; init; } = new();
    public List<DashboardChartPointDto> ChartData { get; init; } = new();
    public List<RecentOrderDto> RecentOrders { get; init; } = new();
}

public record SellerMetricsDto
{
    public decimal TotalSales { get; init; }
    public int OrdersCount { get; init; }
    public decimal AvgOrderValue { get; init; }
}

public record DashboardChartPointDto
{
    public string Date { get; init; } = string.Empty;
    public decimal Sales { get; init; }
}

public record RecentOrderDto
{
    public int Id { get; init; }
    public string BuyerName { get; init; } = string.Empty;
    public string Date { get; init; } = string.Empty;
    public decimal Total { get; init; }
    public string Status { get; init; } = string.Empty;
}

// ===================== Error Response =====================

public record ErrorResponse
{
    public string Message { get; init; } = string.Empty;
    public string? Code { get; init; }
    public Dictionary<string, string[]>? Errors { get; init; }
}
