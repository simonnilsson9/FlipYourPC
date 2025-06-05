using FlipYourPC.Entities;

namespace FlipYourPC.Models
{
    public class PC
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string Description { get; set; }
        public List<Component> Components { get; set; }
        public int ListPrice { get; set; }
        public int Price { get; set; }
        public string ImageURL { get; set; }
        [Obsolete("Använd Status istället.")]
        public bool IsSold { get; set; } = false;
        public Guid UserId { get; set; }
        public User User { get; set; }
        public int ComponentsTotalCost { get; set; } = 0;
        public DateTime ListedAt { get; set; }
        public DateTime? SoldAt { get; set; }
        public PCStatus Status { get; set; } = PCStatus.Planning; // Default är "Planning"
        public decimal DeductibleVAT { get; set; } = 0; 
        public decimal OutgoingVAT { get; set; } = 0;
        public bool VATCalculated { get; set; } = false;
    }
    
    public enum PCStatus
    {
        Planning,
        Sold,
        ForSale,
    }
}
