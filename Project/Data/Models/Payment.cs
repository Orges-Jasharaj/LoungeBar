using Project.Data.Enums;

namespace Project.Data.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order Order { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
