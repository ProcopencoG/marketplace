using System.Text.Json.Serialization;
using PiataOnline.Core.Enums;

namespace PiataOnline.Core.Entities;

public class Stall
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? CoverUrl { get; set; }
    public StallStatus Status { get; set; } = StallStatus.Pending;
    // Rating and ReviewsCount are now calculated dynamically from reviews (DRY principle)
    public DateTime? DeletedAt { get; set; } // Soft delete
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign keys
    public int UserId { get; set; }

    // Navigation properties (JsonIgnore prevents OpenAPI circular reference issues)
    [JsonIgnore]
    public User User { get; set; } = null!;
    [JsonIgnore]
    public ICollection<Product> Products { get; set; } = new List<Product>();
    [JsonIgnore]
    public ICollection<Order> Orders { get; set; } = new List<Order>();

    // Computed properties
    public bool IsActive => DeletedAt == null;
}
