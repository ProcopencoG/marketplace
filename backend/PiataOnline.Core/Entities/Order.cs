using System.Text.Json.Serialization;
using System.Collections.Generic;
using System;
using PiataOnline.Core.Enums;

namespace PiataOnline.Core.Entities;

public class Order
{
    public int Id { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.NewOrder;
    public int TotalCents { get; set; }
    public string? PickupCode { get; set; } // For pickup verification
    public string? CancellationReason { get; set; }
    public string? Location { get; set; } // Delivery address
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign keys
    public int UserId { get; set; }
    public int StallId { get; set; }

    // Navigation properties (JsonIgnore prevents OpenAPI circular reference issues)
    [JsonIgnore]
    public User User { get; set; } = null!;
    [JsonIgnore]
    public Stall Stall { get; set; } = null!;
    [JsonIgnore]
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    [JsonIgnore]
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    [JsonIgnore]
    public ICollection<Review> Reviews { get; set; } = new List<Review>();

    // Computed properties
    public decimal TotalPrice => TotalCents / 100.0m;
    public bool IsActive => Status != OrderStatus.Cancelled;
}
