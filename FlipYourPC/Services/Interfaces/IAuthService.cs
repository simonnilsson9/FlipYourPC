using FlipYourPC.Entities;
using FlipYourPC.Models.DTO;

namespace FlipYourPC.Services.Interfaces
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDTO request);
        Task<TokenResponseDTO?> LoginAsync(string identifier, string password);
        Task<TokenResponseDTO?> RefreshTokensAsync(RefreshTokenRequestDTO request);
    }
}
