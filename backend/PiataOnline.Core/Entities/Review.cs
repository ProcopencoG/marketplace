using System.Text.Json.Serialization;

namespace PiataOnline.Core.Entities;

public class Review
{
    public int Id { get; set; }
    public int Rating { get; set; } // 1-5
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign keys
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int OrderId { get; set; }

    // Navigation properties (JsonIgnore prevents OpenAPI circular reference issues)
    [JsonIgnore]
    public User User { get; set; } = null!;
    [JsonIgnore]
    public Product Product { get; set; } = null!;
    [JsonIgnore]
    public Order Order { get; set; } = null!;
}
