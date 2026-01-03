using System.Text.Json.Serialization;

namespace PiataOnline.Core.Entities;

public class Message
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign keys
    public int UserId { get; set; }
    public int OrderId { get; set; }

    // Navigation properties (JsonIgnore prevents OpenAPI circular reference issues)
    [JsonIgnore]
    public User User { get; set; } = null!;
    [JsonIgnore]
    public Order Order { get; set; } = null!;
}
