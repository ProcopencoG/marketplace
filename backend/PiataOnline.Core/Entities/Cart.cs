using System.Text.Json.Serialization;

namespace PiataOnline.Core.Entities;

public class Cart
{
    public int Id { get; set; }
    public string Status { get; set; } = "active";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign keys (nullable for guest carts)
    public int? UserId { get; set; }

    // Navigation properties (JsonIgnore prevents OpenAPI circular reference issues)
    [JsonIgnore]
    public User? User { get; set; }
    [JsonIgnore]
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
