using Project.Data.Enums;

namespace Project.Data.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public int TableId { get; set; }
        public Table Table { get; set; }
        public int? ShiftId { get; set; }
        public Shift? Shift { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public bool IsVisibleToCustomers { get; set; } = true;
        public ICollection<OrderItem> OrderItems { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
