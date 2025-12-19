namespace Project.Dtos.Requests
{
    public class CreateDrinkDto 
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public bool IsAlcoholic { get; set; }
        public double? AlcoholPercentage { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
    }
}
