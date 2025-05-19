using FlipYourPC.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClosedXML.Excel;
using FlipYourPC.Models;

namespace FlipYourPC.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExportController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        private readonly IPCService _pcService;

        public ExportController(IInventoryService inventoryService, IPCService pcService)
        {
            _inventoryService = inventoryService;
            _pcService = pcService;
        }

        [Authorize(Roles = "Användare,Admin")]
        [HttpGet("export-excel")]
        public async Task<IActionResult> ExportInventoryAsExcel()
        {
            var inventory = await _inventoryService.GetInventoryAsync();
            if (inventory == null || inventory.Components.Count == 0)
            {
                return NotFound("Ingen komponentdata att exportera.");
            }


            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Lager");

                //Rubriker
                worksheet.Cell(1, 1).Value = "Typ";
                worksheet.Cell(1, 2).Value = "Namn";
                worksheet.Cell(1, 3).Value = "Tillverkare";
                worksheet.Cell(1, 4).Value = "Inköpspris";
                worksheet.Cell(1, 5).Value = "Skick";
                worksheet.Cell(1, 6).Value = "Butik";

                //Komponent-data
                int row = 2;
                foreach (var comp in inventory.Components)
                {
                    worksheet.Cell(row, 1).Value = comp.Type.ToString();
                    worksheet.Cell(row, 2).Value = comp.Name;
                    worksheet.Cell(row, 3).Value = comp.Manufacturer;
                    worksheet.Cell(row, 4).Value = comp.Price;
                    worksheet.Cell(row, 5).Value = comp.Condition == ComponentCondition.New ? "Ny" : "Begagnad";
                    worksheet.Cell(row, 6).Value = comp.Store ?? "-";
                    row++;
                }

                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    stream.Position = 0;

                    return File(
                        stream.ToArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "inventory-export.xlsx"
                    );
                }
            }
        }
        
    }
}
