namespace Project.Data.Models
{
    public class Drink
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        public bool IsAlcoholic { get; set; }
        public double? AlcoholPercentage { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
