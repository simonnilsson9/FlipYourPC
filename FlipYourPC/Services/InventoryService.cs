using FlipYourPC.Data;
using FlipYourPC.Models;
using FlipYourPC.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FlipYourPC.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _appDbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public InventoryService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _appDbContext = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentUserId()
        {
            // Hämta användarens ID från den aktuella HTTP-kontexten
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                return Guid.Parse(userIdClaim.Value);
            }

            throw new UnauthorizedAccessException("User not authenticated");
        }

        public async Task AddComponentToInventoryAsync(Component component)
        {
            var userId = GetCurrentUserId();
            var inventory = _appDbContext.Inventories.FirstOrDefault(i => i.UserId == userId);

            if(inventory == null)
            {
                inventory = new Inventory{ UserId = userId };
                await _appDbContext.Inventories.AddAsync(inventory);
            }

            inventory.Components.Add(component);
            inventory.TotalValue += component.Price;
            await _appDbContext.SaveChangesAsync();
        }

        public async Task<Inventory> GetInventoryAsync()
        {
            var userId = GetCurrentUserId();
            var inventory = await _appDbContext.Inventories
            .Where(i => i.UserId == userId)
            .Include(i => i.Components)
            .FirstOrDefaultAsync();

            if (inventory == null)
            {
                inventory = new Inventory { UserId = userId };
                await _appDbContext.Inventories.AddAsync(inventory);
                await _appDbContext.SaveChangesAsync();
            }   

            inventory.TotalValue = inventory.Components.Sum(c => c.Price);
            return inventory;
        }

        public async Task RemoveComponentFromInventoryAsync(Guid componentId)
        {
            var userId = GetCurrentUserId();
            var inventory = await _appDbContext.Inventories.Include(i => i.Components)
                .FirstOrDefaultAsync(i => i.UserId == userId);

            if(inventory != null)
            {
                var component = inventory.Components.FirstOrDefault(c => c.Id == componentId);
                if (component != null)
                {
                    inventory.Components.Remove(component);
                    inventory.TotalValue -= component.Price;
                    await _appDbContext.SaveChangesAsync();
                }
            }
        }
    }
}
