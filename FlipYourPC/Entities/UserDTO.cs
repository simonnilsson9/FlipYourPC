using System.ComponentModel.DataAnnotations;

namespace FlipYourPC.Entities
{
    public class UserDTO
    {
        [Required(ErrorMessage = "Användarnamn är obligatoriskt.")]
        [StringLength(25, ErrorMessage = "Användarnamnet får max vara 25 tecken.")]
        public string Username { get; set; } = string.Empty;
        [Required(ErrorMessage = "E-postadress är obligatorisk.")]
        [EmailAddress(ErrorMessage = "Ogiltig e-postadress.")]
        public string Email { get; set; } = string.Empty;
        [Required(ErrorMessage = "Lösenord är obligatoriskt.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Lösenordet måste vara minst 6 tecken långt.")]
        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d).{6,}$", ErrorMessage = "Lösenordet måste innehålla både bokstäver och siffror.")]
        public string Password { get; set; } = string.Empty;
    }
}
