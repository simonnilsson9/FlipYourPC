using FlipYourPC.Models;
using FlipYourPC.Services;
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

        [HttpGet]
        public async Task<IActionResult> GetAllComponents()
        {
            var response = new APIResponse();
            try
            {
                var components = await _componentService.GetAllComponentsAsync();
                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.OK;
                response.Result = components;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.NotFound;
                response.ErrorMessages.Add(ex.Message);
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }     
        }

        [Authorize]
        [HttpGet]
        [Route("{id:guid}")]
        public async Task<IActionResult> GetComponentById([FromRoute] Guid id)
        {
            var response = new APIResponse();
            try
            {
                var component = await _componentService.GetComponentByIdAsync(id);
                if (component == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.NotFound;
                    response.ErrorMessages.Add("Component not found.");
                    return NotFound(response);
                }

                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.OK;
                response.Result = component;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error fetching component: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateComponent([FromBody] Component component)
        {
            var response = new APIResponse();
            try
            {
                if (component == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.ErrorMessages.Add("Invalid component data.");
                    return BadRequest(response);
                }

                // Lägg till komponenten i databasen (Components-tabellen)
                await _componentService.CreateComponentAsync(component);

                // Lägg till komponenten i inventory
                await _inventoryService.AddComponentToInventoryAsync(component);

                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.Created;
                response.Result = component;

                return CreatedAtAction(nameof(GetComponentById), new { id = component.Id }, response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error creating component: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }

        [Authorize]
        [HttpPut]
        [Route("{id:guid}")]
        public async Task<IActionResult> UpdateComponent([FromRoute] Guid id, Component component)
        {
            var response = new APIResponse();
            try
            {
                var existingComponent = await _componentService.GetComponentByIdAsync(id);
                if (existingComponent == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.NotFound;
                    response.ErrorMessages.Add("Component not found.");
                    return NotFound(response);
                }

                existingComponent.Name = component.Name;
                existingComponent.Price = component.Price;
                existingComponent.Manufacturer = component.Manufacturer;
                existingComponent.Type = component.Type;
                existingComponent.PCId = component.PCId;

                await _componentService.UpdateComponentAsync(existingComponent);
                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.NoContent;
                return NoContent();
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error updating component: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }

        [Authorize]
        [HttpDelete]
        [Route("{id:guid}")]
        public async Task<IActionResult> DeleteComponent([FromRoute] Guid id)
        {
            var response = new APIResponse();
            try
            {
                var component = await _componentService.GetComponentByIdAsync(id);
                if (component == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.NotFound;
                    response.ErrorMessages.Add("Component not found.");
                    return NotFound(response);
                }

                // Ta bort komponenten från inventory
                await _inventoryService.RemoveComponentFromInventoryAsync(id);

                // Ta bort komponenten från Components-tabellen
                await _componentService.DeleteComponentAsync(component);

                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.NoContent;
                return NoContent();
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error deleting component: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("name/{name}")]
        public async Task<IActionResult> GetComponentByName([FromRoute] string name)
        {
            var response = new APIResponse();
            try
            {
                var component = await _componentService.GetComponentByNameAsync(name);
                if (component == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.NotFound;
                    response.ErrorMessages.Add("Component not found.");
                    return NotFound(response);
                }

                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.OK;
                response.Result = component;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error fetching component by name: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }
    }
}
