using FlipYourPC.Data;
using FlipYourPC.Entities;
using FlipYourPC.Models.DTO;
using FlipYourPC.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FlipYourPC.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _appDbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public UserService(AppDbContext appDbContext, IHttpContextAccessor httpContextAccessor)
        {
            _appDbContext = appDbContext;
            _httpContextAccessor = httpContextAccessor;
        }
        public Guid GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                return Guid.Parse(userIdClaim.Value); // Returnera användarens Id
            }

            throw new UnauthorizedAccessException("User not authenticated");
        }
        public async Task DeleteUser(User user)
        {
            _appDbContext.Users.Remove(user);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _appDbContext.Users.ToListAsync();
        }

        public async Task<User> GetUserByIdAsync(Guid id)
        {
            return await _appDbContext.Users
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task UpdateUser(UserUpdateDTO userDto)
        {
            var currentUserId = GetCurrentUserId();

            var userToUpdate = await _appDbContext.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (userToUpdate == null)
            {
                throw new ArgumentException("User not found.");
            }

            if (await _appDbContext.Users.AnyAsync(u => u.Email == userDto.Email && u.Id != currentUserId))
            {
                throw new ArgumentException("Email används redan av en annan användare.");
            }

            if (await _appDbContext.Users.AnyAsync(u => u.Username == userDto.Username && u.Id != currentUserId))
            {
                throw new ArgumentException("Användarnamn används redan av en annan användare.");
            }

            userToUpdate.Username = userDto.Username;
            userToUpdate.Email = userDto.Email;
            userToUpdate.FirstName = userDto.FirstName;
            userToUpdate.LastName = userDto.LastName;
            userToUpdate.PhoneNumber = userDto.PhoneNumber;
            userToUpdate.Address = userDto.Address;
            userToUpdate.ZipCode = userDto.ZipCode;
            userToUpdate.City = userDto.City;

            _appDbContext.Users.Update(userToUpdate);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task ChangePasswordAsync(ChangePasswordDTO dto)
        {
            var currentuserId = GetCurrentUserId();

            var user = await _appDbContext.Users
                .FirstOrDefaultAsync(u => u.Id == currentuserId);

            if (user == null)
            {
                throw new ArgumentException("User not found.");
            }

            var passwordHasher = new PasswordHasher<User>();

            var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.OldPassword);
            if (result == PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedAccessException("Old password is incorrect.");
            }
            user.PasswordHash = passwordHasher.HashPassword(user, dto.NewPassword);

            _appDbContext.Users.Update(user);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task UpdateUserRole(UserUpdateRoleDTO dto)
        {
            var userToUpdateRole = await _appDbContext.Users
            .FirstOrDefaultAsync(u => u.Id == dto.UserId);

            if (userToUpdateRole == null)
            {
                throw new ArgumentException("User not found.");
            }

            if(dto.NewRole != UserRoles.Admin && dto.NewRole != UserRoles.User)
            {
                throw new Exception("Invalid role");
            }

            userToUpdateRole.Role = dto.NewRole;
            _appDbContext.Users.Update(userToUpdateRole);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task UpdateUserAsAdmin(Guid userId, UserUpdateDTO dto)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new ArgumentException("User not found.");
            }

            if (await _appDbContext.Users.AnyAsync(u => u.Email == dto.Email && u.Id != userId))
            {
                throw new ArgumentException("E-postadressen används redan av en annan användare.");
            }

            if (await _appDbContext.Users.AnyAsync(u => u.Username == dto.Username && u.Id != userId))
            {
                throw new ArgumentException("Användarnamnet används redan av en annan användare.");
            }

            user.Username = dto.Username;
            user.Email = dto.Email;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.PhoneNumber = dto.PhoneNumber;
            user.Address = dto.Address;
            user.ZipCode = dto.ZipCode;
            user.City = dto.City;

            await _appDbContext.SaveChangesAsync();
        }

        public async Task ChangePasswordAsAdmin(ChangePasswordAdminDTO dto)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId);
            if (user == null)
            {
                throw new ArgumentException("Användaren hittades inte.");
            }

            var passwordHasher = new PasswordHasher<User>();
            user.PasswordHash = passwordHasher.HashPassword(user, dto.NewPassword);

            await _appDbContext.SaveChangesAsync();
        }
    }
}
