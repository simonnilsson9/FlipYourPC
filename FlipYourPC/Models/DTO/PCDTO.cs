using System.ComponentModel.DataAnnotations;

namespace FlipYourPC.Models.DTO
{
    public class PCDTO
    {
        [Required(ErrorMessage = "Namn är obligatoriskt.")]
        [StringLength(50, ErrorMessage = "Namnet får max vara 50 tecken.")]
        public string Name { get; set; }
        public List<Guid> ComponentIds { get; set; }
        public DateTime ListedAt { get; set; }
    }
}
