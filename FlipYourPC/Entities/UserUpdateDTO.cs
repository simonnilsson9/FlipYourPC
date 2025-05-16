using System.ComponentModel.DataAnnotations;

namespace FlipYourPC.Entities
{
    public class UserUpdateDTO
    {
        [Required(ErrorMessage = "Användarnamn är obligatoriskt.")]
        [StringLength(25, ErrorMessage = "Användarnamnet får max vara 25 tecken.")]
        public string Username { get; set; } = string.Empty;
        [Required(ErrorMessage = "E-postadress är obligatorisk.")]
        [EmailAddress(ErrorMessage = "Ogiltig e-postadress.")]
        public string Email { get; set; } = string.Empty;
        [StringLength(25, ErrorMessage = "Förnamnet får max vara 25 tecken.")]
        public string FirstName { get; set; } = string.Empty;
        [StringLength(50, ErrorMessage = "Efternamnet får max vara 50 tecken.")]
        public string LastName { get; set; } = string.Empty;
        [Phone(ErrorMessage = "Ogiltigt telefonnummer.")]
        [StringLength(20, ErrorMessage = "Telefonnumret får max vara 20 tecken.")]
        public string PhoneNumber { get; set; } = string.Empty;
        [StringLength(50, ErrorMessage = "Adressen får max vara 50 tecken.")]
        public string Address { get; set; } = string.Empty;
        [RegularExpression(@"^\d{3}\s?\d{2}$", ErrorMessage = "Postnumret måste vara i formatet 123 45 eller 12345.")]
        public string ZipCode { get; set; } = string.Empty;
        [StringLength(50, ErrorMessage = "Stadens namn får max vara 50 tecken.")]
        public string City { get; set; } = string.Empty;
    }
}
