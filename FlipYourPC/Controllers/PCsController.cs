using FlipYourPC.Models;
using FlipYourPC.Models.DTO;
using FlipYourPC.Services;
using FlipYourPC.Services.Interfaces;
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
        private readonly IComponentService _componentService;
        private readonly IInventoryService _inventoryService;
        public PCsController(IPCService PCService, IComponentService componentService, IInventoryService inventoryService)
        {
            _pcService = PCService;
            _componentService = componentService;
            _inventoryService = inventoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPCs()
        {
            var response = new APIResponse();
            try
            {
                var pcs = await _pcService.GetAllPCsAsync();
                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.OK;
                response.Result = pcs;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error fetching PCs: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }

        [HttpGet]
        [Route("{id:guid}")]
        public async Task<IActionResult> GetPCById([FromRoute] Guid id)
        {
            var response = new APIResponse();
            try
            {
                var pc = await _pcService.GetPCByIdAsync(id);
                if (pc == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.NotFound;
                    response.ErrorMessages.Add("PC not found.");
                    return NotFound(response);
                }

                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.OK;
                response.Result = pc;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error fetching PC: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreatePC([FromBody] PCDTO pcDTO)
        {
            var response = new APIResponse();
            try
            {
                if (pcDTO == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.ErrorMessages.Add("Invalid PC data.");
                    return BadRequest(response);
                }

                var pc = new PC
                {
                    Name = pcDTO.Name                    
                };

                await _pcService.CreatePCAsync(pcDTO);

                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.Created;
                response.Result = pc;

                return CreatedAtAction(nameof(GetPCById), new { id = pc.Id }, response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error creating PC: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }

        [HttpPut]
        [Route("{pcId:guid}/add-components")]
        public async Task<IActionResult> AddComponentsToPC([FromRoute] Guid pcId, [FromBody] List<Guid> componentIds)
        {
            var response = new APIResponse();

            try
            {
                if (componentIds == null || !componentIds.Any())
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.ErrorMessages.Add("No components specified.");
                    return BadRequest(response);
                }

                await _pcService.AddComponentToPCAsync(pcId, componentIds);

                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.OK;
                response.Result = "Components successfully added to PC.";

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error adding components to PC: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }

        [HttpPut]
        [Route("{id:guid}")]
        public async Task<IActionResult> UpdatePC([FromRoute] Guid id, [FromBody] PCUpdateDTO pcDTO)
        {
            var response = new APIResponse();
            try
            {
                if (pcDTO == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.ErrorMessages.Add("Invalid PC data.");
                    return BadRequest(response);
                }

                var existingPC = await _pcService.GetPCByIdAsync(id);
                if (existingPC == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.NotFound;
                    response.ErrorMessages.Add("PC not found.");
                    return NotFound(response);
                }

                var componentsInStock = await _componentService.GetAllComponentsAsync();

                if (componentsInStock == null || !componentsInStock.Any())
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.ErrorMessages.Add("No components available in the inventory.");
                    return BadRequest(response);
                }

                if (pcDTO.ComponentIds == null || !pcDTO.ComponentIds.Any())
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.ErrorMessages.Add("No component IDs provided.");
                    return BadRequest(response);
                }

                var validComponents = componentsInStock.Where(c => pcDTO.ComponentIds.Contains(c.Id)).ToList();

                if (validComponents.Count != pcDTO.ComponentIds.Count)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.ErrorMessages.Add("One or more components are not available in the inventory.");
                    return BadRequest(response);
                }

                existingPC.Name = pcDTO.Name;
                existingPC.Description = pcDTO.Description;
                existingPC.Price = pcDTO.Price;
                existingPC.ImageURL = pcDTO.ImageURL;
                existingPC.Components = validComponents;
                existingPC.IsSold = pcDTO.IsSold;

                await _pcService.UpdatePCAsync(existingPC);

                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.OK;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error updating PC: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }

        [HttpDelete]
        [Route("{id:guid}")]
        public async Task<IActionResult> DeletePC([FromRoute] Guid id)
        {
            var response = new APIResponse();
            try
            {
                var existingPC = await _pcService.GetPCByIdAsync(id);
                if (existingPC == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.NotFound;
                    response.ErrorMessages.Add("PC not found.");
                    return NotFound(response);
                }

                await _pcService.DeletePCAsync(existingPC);
                response.IsSuccess = true;
                response.StatusCode = HttpStatusCode.NoContent;
                return NoContent(); 
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages.Add($"Error deleting PC: {ex.Message}");
                return StatusCode((int)HttpStatusCode.InternalServerError, response);
            }
        }
    }
}
