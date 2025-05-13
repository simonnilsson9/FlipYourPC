using FlipYourPC.Models;
using FlipYourPC.Models.DTO;

namespace FlipYourPC.Services.Interfaces
{
    public interface IPCService
    {
        Task<IEnumerable<PC>> GetAllPCsAsync();
        Task<PC> GetPCByIdAsync(Guid id);
        Task CreatePCAsync(PCDTO pc);
        Task UpdatePCAsync(PC pc);
        Task DeletePCAsync(PC pc);
        Task AddComponentToPCAsync(Guid pcID, List<Guid> componentIds);
        Task RemoveComponentFromPCAsync(Guid pcId, List<Guid> componentIds);
    }
}
