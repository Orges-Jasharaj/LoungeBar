using Project.Data.Models;

namespace Project.Dtos.Responses
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<Drink>? Drinks { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
