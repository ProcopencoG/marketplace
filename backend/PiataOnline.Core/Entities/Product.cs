using System.Text.Json.Serialization;
using PiataOnline.Core.Enums;

namespace PiataOnline.Core.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PriceCents { get; set; } // Price stored in cents (e.g., 2550 = 25.50 RON)
    public Unit Unit { get; set; }
    public ProductCategory Category { get; set; }
    public StockType StockType { get; set; }
    public int? StockQuantity { get; set; } // Only for Limited stock type
    public string? ImageUrl { get; set; }
    public DateTime? DeletedAt { get; set; } // Soft delete
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign keys
    public int StallId { get; set; }

    // Navigation properties (JsonIgnore prevents OpenAPI circular reference issues)
    [JsonIgnore]
    public Stall Stall { get; set; } = null!;
    [JsonIgnore]
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    [JsonIgnore]
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    [JsonIgnore]
    public ICollection<Review> Reviews { get; set; } = new List<Review>();

    // Computed properties
    public bool IsActive => DeletedAt == null;
    public decimal Price => PriceCents / 100.0m;
}
