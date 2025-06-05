using FlipYourPC.Data;
using FlipYourPC.Models;
using FlipYourPC.Models.DTO;
using FlipYourPC.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Component = FlipYourPC.Models.Component;

namespace FlipYourPC.Services
{
    public class PCService : IPCService
    {
        private readonly AppDbContext _appDbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public PCService(AppDbContext appDbContext, IHttpContextAccessor httpContextAccessor)
        {
            _appDbContext = appDbContext;
            _httpContextAccessor = httpContextAccessor;
        }
        private Guid GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                return Guid.Parse(userIdClaim.Value);
            }

            throw new UnauthorizedAccessException("User not authenticated");
        }

        public async Task AddComponentToPCAsync(Guid pcID, List<Guid> componentIds)
        {
            var userId = GetCurrentUserId();

            // Hämta PC:n som tillhör den inloggade användaren
            var pc = await _appDbContext.PCs
                .Include(p => p.Components)
                .FirstOrDefaultAsync(p => p.Id == pcID && p.UserId == userId);

            if (pc == null)
                throw new ArgumentException("PC not found or it does not belong to the current user.");

            // Hämta användarens inventory
            var inventory = await _appDbContext.Inventories
                .Where(i => i.UserId == userId)
                .Include(i => i.Components)
                .FirstOrDefaultAsync();

            if (inventory == null)
                throw new UnauthorizedAccessException("No inventory found for the user.");

            // Hämta alla komponenter som användaren försöker lägga till
            var componentsToAdd = inventory.Components
                .Where(c => componentIds.Contains(c.Id) && c.PCId == null)
                .ToList();

            // Samla redan tillagda typer i PC:n
            var existingComponentTypes = pc.Components
                .Select(c => c.Type)
                .ToHashSet();

            foreach (var component in componentsToAdd)
            {
                if (existingComponentTypes.Contains(component.Type))
                {
                    // Hoppa över komponenten om samma typ redan finns
                    continue;
                }

                pc.Components.Add(component);
                component.PCId = pc.Id;

                _appDbContext.Components.Update(component);
                existingComponentTypes.Add(component.Type); // Lägg till typen i hashset
            }

            await _appDbContext.SaveChangesAsync();
        }

        public async Task CreatePCAsync(PCDTO pcDTO)
        {
            var userId = GetCurrentUserId();
            var pc = new PC
            {
                Name = pcDTO.Name,
                UserId = userId, //Koppla till den inloggade användaren
                Components = new List<Component>(),
                ListedAt = DateTime.UtcNow
            };                       

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
            var userId = GetCurrentUserId();
            return await _appDbContext.PCs
                                       .Where(p => p.UserId == userId)
                                       .Include(p => p.Components)
                                       .ToListAsync();
        }

        public async Task<PC> GetPCByIdAsync(Guid id)
        {
            var userId = GetCurrentUserId();
            return await _appDbContext.PCs
                .Where(p => p.Id == id && p.UserId == userId)
                .Include(p => p.Components)
                .FirstOrDefaultAsync();
        }

        public async Task UpdatePCAsync(PC pc)
        {
            var userId = GetCurrentUserId();

            if (pc.UserId != userId)
            {
                throw new UnauthorizedAccessException("You can only update PCs that belong to you.");
            }

            _appDbContext.PCs.Update(pc);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task RemoveComponentFromPCAsync(Guid pcId, List<Guid> componentIds)
        {
            var userId = GetCurrentUserId();

            var pc = await _appDbContext.PCs
                .Include(p => p.Components)
                .FirstOrDefaultAsync(p => p.Id == pcId && p.UserId == userId);

            if (pc == null)
                throw new ArgumentException("PC not found or it does not belong to the current user.");

            var inventory = await _appDbContext.Inventories
                .Where(i => i.UserId == userId)
                .Include(i => i.Components)
                .FirstOrDefaultAsync();

            if (inventory == null)
                throw new UnauthorizedAccessException("No inventory found for the user.");

            var componentsToRemove = pc.Components.Where(c => componentIds.Contains(c.Id)).ToList();

            foreach (var component in componentsToRemove)
            {
                component.PCId = null;
                pc.Components.Remove(component);
                inventory.Components.Add(component); // Lägg tillbaka i lagret
            }

            _appDbContext.PCs.Update(pc);
            _appDbContext.Inventories.Update(inventory);

            await _appDbContext.SaveChangesAsync();
        }

        public async Task CalculateVATAsync(Guid pcId)
        {
            var userId = GetCurrentUserId();
            var pc = await _appDbContext.PCs.
                Include(p => p.Components).
                FirstOrDefaultAsync(p => p.Id == pcId && p.UserId == userId);

            if(pc == null)
            {
                throw new ArgumentException("PC not found or it does not belong to the current user.");
            }

            const double vatRate = 0.25;

            // 1. Ingående moms – på nya komponenter
            var deductibleVAT = pc.Components
                .Where(c => c.Condition == ComponentCondition.New)
                .Sum(c => (int)Math.Round(c.Price * vatRate / (1 + vatRate)));

            // 2. Utgående moms – på försäljningspris eller listpris
            var basePrice = pc.Price > 0 ? pc.Price : pc.ListPrice;
            var outgoingVAT = (int)Math.Round(basePrice * vatRate / (1 + vatRate));

            pc.DeductibleVAT = deductibleVAT;
            pc.OutgoingVAT = outgoingVAT;
            pc.VATCalculated = true;

            await _appDbContext.SaveChangesAsync();

        }
    }
}
