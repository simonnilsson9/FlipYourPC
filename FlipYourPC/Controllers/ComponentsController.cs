using FlipYourPC.Models;
using FlipYourPC.Models.DTO;
using FlipYourPC.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace FlipYourPC.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComponentsController : ControllerBase
    {
        private readonly IComponentService _componentService;
        private readonly IInventoryService _inventoryService;
        public ComponentsController(IComponentService service, IInventoryService inventoryService)
        {
            _componentService = service;
            _inventoryService = inventoryService;
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllComponents()
        {            
            try
            {
                var components = await _componentService.GetAllComponentsAsync();
                return Ok(components);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }     
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpGet]
        [Route("{id:guid}")]
        public async Task<IActionResult> GetComponentById([FromRoute] Guid id)
        {           
            try
            {
                var component = await _componentService.GetComponentByIdAsync(id);
                if (component == null)
                {
                    return NotFound("Komponenten hittades inte.");
                }

                return Ok(component);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateComponent([FromBody] ComponentDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var component = new Component
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Price = dto.Price,
                Manufacturer = dto.Manufacturer,
                Store = dto.Store,
                Type = dto.Type,
                Condition = dto.Condition
            };

            await _componentService.CreateComponentAsync(component);
            await _inventoryService.AddComponentToInventoryAsync(component);

            return CreatedAtAction(nameof(GetComponentById), new { id = component.Id }, component);
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateComponent(Guid id, [FromBody] ComponentDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingComponent = await _componentService.GetComponentByIdAsync(id);
            if (existingComponent == null)
                return NotFound("Komponent hittades inte.");

            existingComponent.Name = dto.Name;
            existingComponent.Price = dto.Price;
            existingComponent.Manufacturer = dto.Manufacturer;
            existingComponent.Store = dto.Store;
            existingComponent.Type = dto.Type;
            existingComponent.Condition = dto.Condition;

            await _componentService.UpdateComponentAsync(existingComponent);

            return NoContent();
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpDelete]
        [Route("{id:guid}")]
        public async Task<IActionResult> DeleteComponent([FromRoute] Guid id)
        {
            try
            {
                var component = await _componentService.GetComponentByIdAsync(id);
                if (component == null)
                {
                    return NotFound("Komponenten hittades inte.");
                }

                // Ta bort komponenten från inventory
                await _inventoryService.RemoveComponentFromInventoryAsync(id);

                // Ta bort komponenten från Components-tabellen
                await _componentService.DeleteComponentAsync(component);

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpGet]
        [Route("name/{name}")]
        public async Task<IActionResult> GetComponentByName([FromRoute] string name)
        {
            try
            {
                var component = await _componentService.GetComponentByNameAsync(name);
                if (component == null)
                {
                    return NotFound("Komponenten hitttades inte.");
                }

                return Ok(component);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
