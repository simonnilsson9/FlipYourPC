using System.ComponentModel.DataAnnotations;

namespace FlipYourPC.Models.DTO
{
    public class ChangePasswordAdminDTO
    {
        public Guid UserId { get; set; }
        [Required(ErrorMessage = "Lösenord är obligatoriskt.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Lösenordet måste vara minst 6 tecken långt.")]
        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d).{6,}$", ErrorMessage = "Lösenordet måste innehålla både bokstäver och siffror.")]
        public string NewPassword { get; set; }
    }
}
