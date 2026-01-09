namespace Project.Data.Models
{
    public class Table
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public int Capacity { get; set; }
        public byte[]? QRCodeImage { get; set; } // QR Code image për tavolinën
        public ICollection<Order> Orders { get; set; }
        public ICollection<Reservation> Reservations { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
