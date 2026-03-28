using Project.Data.Enums;

namespace Project.Dtos.Requests
{
    public class CreateMenuItemDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public ItemType ItemType { get; set; } = ItemType.Drink;
        public bool IsAlcoholic { get; set; }
        public double? AlcoholPercentage { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
    }
}
