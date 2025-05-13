using FlipYourPC.Data;
using FlipYourPC.Models;

namespace FlipYourPC.Services.Interfaces
{
    public interface IInventoryService
    {
        Task AddComponentToInventoryAsync(Component component);
        Task RemoveComponentFromInventoryAsync(Guid componentId);
        Task<Inventory> GetInventoryAsync();
    }
}
