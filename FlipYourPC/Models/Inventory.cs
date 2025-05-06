using FlipYourPC.Entities;

namespace FlipYourPC.Models
{
    public class Inventory
    {
        public Guid Id { get; set; }
        public List<Component> Components { get; set; } 
        public int TotalValue { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }

        public Inventory()
        {
            Components = new List<Component>();
            TotalValue = 0;
        }
    }
}
