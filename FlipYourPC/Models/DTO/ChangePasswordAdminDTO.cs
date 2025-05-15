namespace FlipYourPC.Models.DTO
{
    public class ChangePasswordAdminDTO
    {
        public Guid UserId { get; set; }
        public string NewPassword { get; set; }
    }
}
