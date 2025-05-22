using System.ComponentModel.DataAnnotations;

namespace FlipYourPC.Models.DTO
{
    public class PCUpdateDTO : IValidatableObject
    {
        [Required(ErrorMessage = "Namn är obligatoriskt.")]
        [StringLength(50, ErrorMessage = "Namnet får max vara 50 tecken.")]
        public string Name { get; set; }
        public string Description { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "Pris måste vara 0 eller högre")]
        public int ListPrice { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "Pris måste vara 0 eller högre")]
        public int Price { get; set; }
        public string ImageURL { get; set; }
        public bool IsSold { get; set; }
        public DateTime ListedAt { get; set; }
        public DateTime? SoldAt { get; set; }
        public PCStatus Status { get; set; }
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            var errors = new List<ValidationResult>();
            if(ListedAt.Date > DateTime.Today)
            {
                errors.Add(new ValidationResult("Listat datum kan inte vara i framtiden.", new[] { nameof(ListedAt) }));
            }

            if (SoldAt.HasValue)
            {
                if(SoldAt.Value.Date > DateTime.Today)
                {
                    errors.Add(new ValidationResult("Sålt datum kan inte vara i framtiden.", new[] { nameof(SoldAt) }));
                }

                if (ListedAt.Date > SoldAt.Value.Date)
                {
                    errors.Add(new ValidationResult("Listat datum måste vara före eller samma dag som sålt datum.", new[] { nameof(SoldAt), nameof(ListedAt) }));
                }
            }

            return errors;
        }
    }
}
