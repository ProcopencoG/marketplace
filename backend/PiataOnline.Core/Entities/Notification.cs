using System.Text.Json.Serialization;

namespace PiataOnline.Core.Entities;

public class Notification
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Params { get; set; } = "{}"; // JSON params
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign keys
    public int RecipientId { get; set; }

    // Navigation properties (JsonIgnore prevents OpenAPI circular reference issues)
    [JsonIgnore]
    public User Recipient { get; set; } = null!;

    // Computed properties
    public bool IsRead => ReadAt != null;
}
