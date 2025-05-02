using AutoMapper;
using FlipYourPC.Data;
using FlipYourPC.Models;
using FlipYourPC.Models.DTO;
using FlipYourPC.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Component = FlipYourPC.Models.Component;

namespace FlipYourPC.Services
{
    public class PCService : IPCService
    {
        private readonly AppDbContext _appDbContext;
        private readonly IMapper _mapper;
        public PCService(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }
        public async Task CreatePCAsync(PCDTO pcDTO)
        {
            var pc = new PC
            {
                Name = pcDTO.Name,
                Description = pcDTO.Description,
                Price = pcDTO.Price,
                ImageURL = pcDTO.ImageURL,
                Components = new List<Component>()
            };
            
            foreach (var componentId in pcDTO.ComponentIds)
            {
                var component = await _appDbContext.Components.FirstOrDefaultAsync(c => c.Id == componentId);
                if(component != null)
                {
                    pc.Components.Add(component);
                }
            }

            await _appDbContext.PCs.AddAsync(pc);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task DeletePCAsync(PC pc)
        {
            _appDbContext.Remove(pc);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<PC>> GetAllPCsAsync()
        {
            return await _appDbContext.PCs.Include(p => p.Components).ToListAsync();
        }

        public async Task<PC> GetPCByIdAsync(Guid id)
        {
            return await _appDbContext.PCs.Include(p => p.Components)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task UpdatePCAsync(PC pc)
        {
            _appDbContext.PCs.Update(pc);
            await _appDbContext.SaveChangesAsync();
        }
    }
}
