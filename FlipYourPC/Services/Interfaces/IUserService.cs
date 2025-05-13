using FlipYourPC.Entities;
using FlipYourPC.Models.DTO;

namespace FlipYourPC.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(Guid id);
        Task UpdateUser(UserUpdateDTO userDTO);
        Task DeleteUser(User user);
        Guid GetCurrentUserId();
        Task ChangePasswordAsync(ChangePasswordDTO dto);
    }
}
