using FlipYourPC.Entities;
using FlipYourPC.Models.DTO;
using FlipYourPC.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FlipYourPC.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching users: {ex.Message}");
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetUserById([FromRoute] Guid id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching user: {ex.Message}");
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateUser([FromBody] UserUpdateDTO userUpdateDTO)
        {
            try
            {
                await _userService.UpdateUser(userUpdateDTO);
                return Ok(new {message = "User updated successfully"});
            }
            catch (Exception ex)
            {

                return BadRequest($"Error updating user: {ex.Message}");
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var currentUserId = _userService.GetCurrentUserId();
                var user = await _userService.GetUserByIdAsync(currentUserId);
                if(user == null)
                {
                    return NotFound(new { message = "User not found." });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {

                return BadRequest($"Error fetching user: {ex.Message}");
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            try
            {
                await _userService.ChangePasswordAsync(dto);
                return Ok(new { message = "Lösenordet har uppdaterats." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("update-role")]
        public async Task<IActionResult> UpdateUserRole([FromBody] UserUpdateRoleDTO dto)
        {
            try
            {
                await _userService.UpdateUserRole(dto);
                return Ok("User role updated successfully");
            }
            catch (Exception ex)
            {

                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                await _userService.DeleteUser(user);
                return NoContent();
            }
            catch (Exception ex)
            {

                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin-update-user/{userId}")]
        public async Task<IActionResult> AdminUpdateUser(Guid userId, [FromBody] UserUpdateDTO userDto)
        {
            try
            {
                await _userService.UpdateUserAsAdmin(userId, userDto);
                return Ok("Användaren har uppdaterats.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin-change-password")]
        public async Task<IActionResult> ChangePasswordAsAdmin([FromBody] ChangePasswordAdminDTO dto)
        {
            try
            {
                await _userService.ChangePasswordAsAdmin(dto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
