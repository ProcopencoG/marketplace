using System.Text.Json.Serialization;
using PiataOnline.Core.Enums;

namespace PiataOnline.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Provider { get; set; } = string.Empty; // "google" or "facebook"
    public string Uid { get; set; } = string.Empty; // OAuth provider user ID
    public string? Location { get; set; } // Default delivery location
    public bool IsAdmin { get; set; }
    public string? RefreshToken { get; set; } // JWT refresh token
    public DateTime? RefreshTokenExpiry { get; set; } // Refresh token expiration
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties (JsonIgnore prevents OpenAPI circular reference issues)
    [JsonIgnore]
    public Stall? Stall { get; set; }
    [JsonIgnore]
    public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    [JsonIgnore]
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    [JsonIgnore]
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    [JsonIgnore]
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    [JsonIgnore]
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
