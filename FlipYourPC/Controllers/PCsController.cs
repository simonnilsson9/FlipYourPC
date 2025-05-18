using FlipYourPC.Models;
using FlipYourPC.Models.DTO;
using FlipYourPC.Services;
using FlipYourPC.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace FlipYourPC.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PCsController : ControllerBase
    {
        private readonly IPCService _pcService;
        private readonly IInventoryService _inventoryService;
        public PCsController(IPCService PCService, IInventoryService inventoryService)
        {
            _pcService = PCService;
            _inventoryService = inventoryService;
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllPCs()
        {
            try
            {
                var pcs = await _pcService.GetAllPCsAsync();
                return Ok(pcs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error fetching PCs: {ex.Message}" });
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpGet]
        [Route("{id:guid}")]
        public async Task<IActionResult> GetPCById([FromRoute] Guid id)
        {
            try
            {
                var pc = await _pcService.GetPCByIdAsync(id);
                if (pc == null)
                {
                    return NotFound(new { message = "PC not found." });
                }

                return Ok(pc);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error fetching PC: {ex.Message}" });
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpPost]
        public async Task<IActionResult> CreatePC([FromBody] PCDTO pcDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                if (pcDTO == null)
                {
                    return BadRequest(new { message = "Invalid PC data." });
                }

                var pc = new PC
                {
                    Name = pcDTO.Name
                };

                await _pcService.CreatePCAsync(pcDTO);

                return CreatedAtAction(nameof(GetPCById), new { id = pc.Id }, pc);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error creating PC: {ex.Message}" });
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpPut]
        [Route("{pcId:guid}/add-components")]
        public async Task<IActionResult> AddComponentsToPC([FromRoute] Guid pcId, [FromBody] List<Guid> componentIds)
        {
            try
            {
                if (componentIds == null || !componentIds.Any())
                {
                    return BadRequest(new { message = "No components specified." });
                }

                await _pcService.AddComponentToPCAsync(pcId, componentIds);

                var updatedPC = await _pcService.GetPCByIdAsync(pcId);
                if(updatedPC != null)
                {
                    updatedPC.ComponentsTotalCost = updatedPC.Components.Sum(c => c.Price);
                    await _pcService.UpdatePCAsync(updatedPC);
                }

                foreach (var componentId in componentIds)
                {
                    await _inventoryService.RemoveComponentFromInventoryAsync(componentId);
                }

                return Ok(new { message = "Components successfully added to PC." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error adding components to PC: {ex.Message}" });
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpPut]
        [Route("{id:guid}")]
        public async Task<IActionResult> UpdatePC([FromRoute] Guid id, [FromBody] PCUpdateDTO pcDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (pcDTO == null)
                {
                    return BadRequest(new { message = "Invalid PC data." });
                }

                var existingPC = await _pcService.GetPCByIdAsync(id);
                if (existingPC == null)
                {
                    return NotFound(new { message = "PC not found." });
                }

                existingPC.Name = pcDTO.Name;
                existingPC.Description = pcDTO.Description;
                existingPC.Price = pcDTO.Price;
                existingPC.ImageURL = pcDTO.ImageURL;
                existingPC.Status = pcDTO.Status;
                existingPC.ListedAt = pcDTO.ListedAt;
                existingPC.SoldAt = pcDTO.SoldAt;

                await _pcService.UpdatePCAsync(existingPC);

                return Ok(new { message = "PC updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error updating PC: {ex.Message}" });
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpDelete]
        [Route("{id:guid}")]
        public async Task<IActionResult> DeletePC([FromRoute] Guid id)
        {
            try
            {
                var existingPC = await _pcService.GetPCByIdAsync(id);
                if (existingPC == null)
                {
                    return NotFound(new { message = "PC not found." });
                }

                await _pcService.DeletePCAsync(existingPC);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error deleting PC: {ex.Message}" });
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpPut("{pcId:guid}/remove-component")]
        public async Task<IActionResult> RemoveComponentFromPC(Guid pcId, [FromBody] Guid componentId)
        {
            try
            {
                await _pcService.RemoveComponentFromPCAsync(pcId, new List<Guid> { componentId });

                var updatedPC = await _pcService.GetPCByIdAsync(pcId);
                if (updatedPC != null)
                {
                    updatedPC.ComponentsTotalCost = updatedPC.Components.Sum(c => c.Price);
                    await _pcService.UpdatePCAsync(updatedPC);
                }

                return Ok(new { message = "Component removed from PC." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error removing component: {ex.Message}" });
            }
        }
    }
}
