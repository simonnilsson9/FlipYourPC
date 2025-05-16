using System.ComponentModel.DataAnnotations;

namespace FlipYourPC.Models.DTO
{
    public class LoginRequestDTO
    {
        [Required(ErrorMessage = "Ange användarnamn eller e-post.")]
        public string Identifier { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ange lösenord.")]
        public string Password { get; set; } = string.Empty;
    }
}
