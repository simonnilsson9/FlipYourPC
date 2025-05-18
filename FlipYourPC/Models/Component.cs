using System.Text.Json.Serialization;

namespace FlipYourPC.Models
{
    public class Component
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required int Price { get; set; }
        public required string Manufacturer { get; set; }
        public string Store { get; set; }
        public ComponentType Type { get; set; }
        public ComponentCondition Condition { get; set; } = ComponentCondition.New;
        [JsonIgnore]
        public Guid? PCId { get; set; } // Foreign key to the PC table
        [JsonIgnore]
        public PC? PC { get; set; } // Navigation property to the PC table
    }

    public enum ComponentType
    {
        GPU, 
        PSU,
        CPU,
        Motherboard,
        RAM,
        SSD,
        Case,
        CPUCooler,
        Other
    }

    public enum ComponentCondition
    {
        New,
        Used
    }
}
