using FlipYourPC.Data;
using FlipYourPC.Models;
using FlipYourPC.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Component = FlipYourPC.Models.Component;

namespace FlipYourPC.Services
{
    public class ComponentService : IComponentService
    {
        private readonly AppDbContext _appDbContext;
        public ComponentService(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }
        public async Task CreateComponentAsync(Component component)
        {
            var inventory = await _appDbContext.Inventories.FirstOrDefaultAsync();
            if (inventory == null)
            {
                inventory = new Inventory
                {
                    Components = new List<Component>()
                };

                _appDbContext.Inventories.Add(inventory);
            }

            inventory.Components.Add(component);
            await _appDbContext.Components.AddAsync(component);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task DeleteComponentAsync(Component component)
        {
            _appDbContext.Components.Remove(component);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<Component>> GetAllComponentsAsync()
        {
            return await _appDbContext.Components.ToListAsync();
        }

        public async Task<Component> GetComponentByIdAsync(Guid id)
        {
            return await _appDbContext.Components
                .FirstOrDefaultAsync(c => c.Id == id); 
        }

        public async Task<Component> GetComponentByNameAsync(string name)
        {
            return await _appDbContext.Components
                .FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());
        }

        public async Task<IEnumerable<Component>> GetComponentsByIdsAsync(IEnumerable<Guid> ids)
        {
            return await _appDbContext.Components.Where(c => ids.Contains(c.Id)).ToListAsync();              
        }

        public async Task UpdateComponentAsync(Component component)
        {
            _appDbContext.Components.Update(component);
            await _appDbContext.SaveChangesAsync();
        }
    }
}
