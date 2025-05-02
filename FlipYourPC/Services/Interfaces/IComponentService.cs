

using FlipYourPC.Models;

namespace FlipYourPC.Services.Interfaces
{
    public interface IComponentService
    {
        Task<IEnumerable<Component>> GetAllComponentsAsync();
        Task<IEnumerable<Component>> GetComponentsByIdsAsync(IEnumerable<Guid> ids);
        Task<Component> GetComponentByIdAsync(Guid id);
        Task CreateComponentAsync(Component component);
        Task UpdateComponentAsync(Component component);
        Task DeleteComponentAsync(Component component);
        Task<Component> GetComponentByNameAsync(string name);
    }
}
