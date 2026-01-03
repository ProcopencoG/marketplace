using System.Text.Json.Serialization;

namespace PiataOnline.Core.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public int PriceCents { get; set; } // Price snapshot at time of order
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign keys
    public int OrderId { get; set; }
    public int ProductId { get; set; }

    // Navigation properties (JsonIgnore prevents OpenAPI circular reference issues)
    [JsonIgnore]
    public Order Order { get; set; } = null!;
    [JsonIgnore]
    public Product Product { get; set; } = null!;

    // Computed properties
    public decimal SubtotalPrice => PriceCents / 100m;
}
