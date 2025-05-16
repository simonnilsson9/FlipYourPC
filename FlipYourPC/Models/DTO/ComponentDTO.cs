using System.ComponentModel.DataAnnotations;

namespace FlipYourPC.Models.DTO
{
    public class ComponentDTO
    {
        [Required]
        [StringLength(100, ErrorMessage = "Namn får max vara 100 tecken.")]
        public string Name { get; set; }
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Pris måste vara ett positivt tal")]
        public int Price { get; set; }
        [StringLength(50, ErrorMessage = "Tillverkare får max vara 50 tecken")]
        public string Manufacturer { get; set; }
        [Required(ErrorMessage = "Typ är obligatoriskt")]
        public ComponentType Type { get; set; }
        [StringLength(100, ErrorMessage = "Butik får max vara 100 tecken")]
        public string Store { get; set; }
    }
}
