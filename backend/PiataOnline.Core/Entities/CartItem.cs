using System.Text.Json.Serialization;

namespace PiataOnline.Core.Entities;

public class CartItem
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign keys
    public int CartId { get; set; }
    public int ProductId { get; set; }

    // Navigation properties (JsonIgnore prevents OpenAPI circular reference issues)
    [JsonIgnore]
    public Cart Cart { get; set; } = null!;
    [JsonIgnore]
    public Product Product { get; set; } = null!;
}
