using FlipYourPC.Data;
using FlipYourPC.Models;
using FlipYourPC.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FlipYourPC.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _appDbContext;
        public InventoryService(AppDbContext context)
        {
            _appDbContext = context;
        }

        public async Task AddComponentToInventoryAsync(Component component)
        {
            var inventory = _appDbContext.Inventories.FirstOrDefault();
            if(inventory == null)
            {
                inventory = new Inventory();
                await _appDbContext.Inventories.AddAsync(inventory);
            }

            inventory.Components.Add(component);
            inventory.TotalValue += component.Price;
            await _appDbContext.SaveChangesAsync();
        }

        public async Task<Inventory> GetInventoryAsync()
        {
            var inventory = await _appDbContext.Inventories
                .Include(i => i.Components)
                .FirstOrDefaultAsync();

            if(inventory == null)
            {
                inventory = new Inventory();                
            }   

            inventory.TotalValue = inventory.Components.Sum(c => c.Price);
            return inventory;
        }

        public async Task RemoveComponentFromInventoryAsync(Guid componentId)
        {
            var inventory = await _appDbContext.Inventories.Include(i => i.Components)
                .FirstOrDefaultAsync();

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
