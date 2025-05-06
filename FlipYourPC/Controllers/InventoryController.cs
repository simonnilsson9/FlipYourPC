using FlipYourPC.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FlipYourPC.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [Authorize]
        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory()
        {
            var inventory = await _inventoryService.GetInventoryAsync();
            if (inventory == null)
            {
                return NotFound("Inventory not found.");
            }
            return Ok(inventory);
        }
        
    }
}
