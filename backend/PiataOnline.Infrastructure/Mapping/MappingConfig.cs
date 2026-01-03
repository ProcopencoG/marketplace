using Mapster;
using PiataOnline.Core.DTOs;
using PiataOnline.Core.Entities;

namespace PiataOnline.Infrastructure.Mapping;

/// <summary>
/// Mapster configuration for Entity ↔ DTO mapping
/// </summary>
public static class MappingConfig
{
    public static void Configure()
    {
        // User mappings
        TypeAdapterConfig<User, UserDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Email, src => src.Email)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.IsAdmin, src => src.IsAdmin)
            .Map(dest => dest.AvatarUrl, src => src.AvatarUrl);

        TypeAdapterConfig<CreateUserRequest, User>.NewConfig()
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Email, src => src.Email)
            .Map(dest => dest.Provider, src => src.Provider)
            .Map(dest => dest.Uid, src => src.Uid)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.AvatarUrl, src => src.AvatarUrl)
            .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow)
            .Map(dest => dest.UpdatedAt, _ => DateTime.UtcNow);

        // Stall mappings (Rating and ReviewsCount calculated separately)
        TypeAdapterConfig<Stall, StallDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.LogoUrl, src => src.LogoUrl)
            .Map(dest => dest.CoverUrl, src => src.CoverUrl)
            .Map(dest => dest.Status, src => src.Status.ToString())
            .Map(dest => dest.UserId, src => src.UserId)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Ignore(dest => dest.Rating)      // Calculated separately
            .Ignore(dest => dest.ReviewsCount); // Calculated separately

        TypeAdapterConfig<CreateStallRequest, Stall>.NewConfig()
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.LogoUrl, src => src.LogoUrl)
            .Map(dest => dest.CoverUrl, src => src.CoverUrl)
            .Map(dest => dest.UserId, src => src.UserId)
            .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow)
            .Map(dest => dest.UpdatedAt, _ => DateTime.UtcNow);

        // Product mappings
        TypeAdapterConfig<Product, ProductDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Price, src => src.Price)
            .Map(dest => dest.Unit, src => src.Unit.ToString())
            .Map(dest => dest.Category, src => src.Category.ToString())
            .Map(dest => dest.StockType, src => src.StockType.ToString())
            .Map(dest => dest.StockQuantity, src => src.StockQuantity)
            .Map(dest => dest.ImageUrl, src => src.ImageUrl)
            .Map(dest => dest.StallId, src => src.StallId)
            .Ignore(dest => dest.Rating)
            .Ignore(dest => dest.ReviewsCount);

        // Order mappings
        TypeAdapterConfig<Order, OrderDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Status, src => src.Status.ToString())
            .Map(dest => dest.TotalPrice, src => src.TotalPrice)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.UserId, src => src.UserId)
            .Map(dest => dest.StallId, src => src.StallId)
            .Map(dest => dest.PickupCode, src => src.PickupCode);

        TypeAdapterConfig<OrderItem, OrderItemDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.ProductId, src => src.ProductId)
            .Map(dest => dest.Quantity, src => src.Quantity)
            .Map(dest => dest.PriceAtPurchase, src => src.SubtotalPrice);

        // Review mappings
        TypeAdapterConfig<Review, ReviewDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Rating, src => src.Rating)
            .Map(dest => dest.Comment, src => src.Comment)
            .Map(dest => dest.ProductId, src => src.ProductId)
            .Map(dest => dest.UserId, src => src.UserId)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt);

        // Message mappings
        TypeAdapterConfig<Message, MessageDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Content, src => src.Content)
            .Map(dest => dest.OrderId, src => src.OrderId)
            .Map(dest => dest.UserId, src => src.UserId)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt);

        // Cart mappings
        TypeAdapterConfig<Cart, CartDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.UserId, src => src.UserId);

        TypeAdapterConfig<CartItem, CartItemDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.ProductId, src => src.ProductId)
            .Map(dest => dest.Quantity, src => src.Quantity);

        // Notification mappings
        TypeAdapterConfig<Notification, NotificationDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Type, src => src.Type)
            .Map(dest => dest.Params, src => src.Params)
            .Map(dest => dest.IsRead, src => src.IsRead)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt);
    }
}
