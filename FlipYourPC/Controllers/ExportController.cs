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

        private static string TranslateComponentType(ComponentType type)
        {
            return type switch
            {
                ComponentType.GPU => "Grafikkort",
                ComponentType.CPU => "Processor",
                ComponentType.RAM => "RAM",
                ComponentType.SSD => "Hårddisk",
                ComponentType.PSU => "Nätaggregat",
                ComponentType.Motherboard => "Moderkort",
                ComponentType.Case => "Chassi",
                ComponentType.CPUCooler => "Processorkylare",
                ComponentType.Other => "Övrigt",
                _ => type.ToString()
            };
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
                foreach (var comp in inventory.Components.OrderBy(c => c.Type.ToString()))
                {
                    worksheet.Cell(row, 1).Value = TranslateComponentType(comp.Type);
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

        [Authorize(Roles = "Användare, Admin")]
        [HttpGet("export-pcs")]
        public async Task<IActionResult> ExportPCsAsExcel([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? statuses)
        {
            var pcs = await _pcService.GetAllPCsAsync();

            if (!pcs.Any() || pcs == null)
            {
                return NotFound("Inga PC-Byggen att exportera.");
            }

            if (fromDate.HasValue)
                pcs = pcs.Where(pc => pc.ListedAt >= fromDate.Value);
            if (toDate.HasValue)
                pcs = pcs.Where(pc => pc.ListedAt <= toDate.Value);

            if (!string.IsNullOrWhiteSpace(statuses))
            {
                var statusList = statuses.Split(',')
                                            .Select(s => s.Trim())
                                            .Where(s => Enum.TryParse<PCStatus>(s, true, out _))
                                            .Select(s => Enum.Parse<PCStatus>(s, true))
                                            .ToList();

                pcs = pcs.Where(pc => statusList.Contains(pc.Status));
            }

            using var workbook = new XLWorkbook();

            foreach (var pc in pcs)
            {
                var worksheet = workbook.Worksheets.Add(pc.Name.Length > 31 ? pc.Name[..31] : pc.Name);
                int row = 1;

                // Titel
                worksheet.Cell(row++, 1).Value = $"PC: {pc.Name}";

                // Rubriker för komponentlistan
                worksheet.Cell(row, 1).Value = "Typ";
                worksheet.Cell(row, 2).Value = "Namn";
                worksheet.Cell(row, 3).Value = "Tillverkare";
                worksheet.Cell(row, 4).Value = "Inköpspris";
                worksheet.Cell(row, 5).Value = "Skick";
                worksheet.Cell(row, 6).Value = "Butik";
                row++;

                foreach (var comp in pc.Components.OrderBy(c => c.Type.ToString()))
                {
                    worksheet.Cell(row, 1).Value = TranslateComponentType(comp.Type);
                    worksheet.Cell(row, 2).Value = comp.Name;
                    worksheet.Cell(row, 3).Value = comp.Manufacturer;
                    worksheet.Cell(row, 4).Value = comp.Price;
                    worksheet.Cell(row, 5).Value = comp.Condition == ComponentCondition.New ? "Ny" : "Begagnad";
                    worksheet.Cell(row, 6).Value = comp.Store ?? "-";
                    row++;
                }

                // Tom rad + sammanfattning
                row++;
                worksheet.Cell(row++, 1).Value = $"💰 Säljpris: {pc.Price} kr";
                worksheet.Cell(row++, 1).Value = $"💸 Totalkostnad: {pc.ComponentsTotalCost} kr";
                worksheet.Cell(row++, 1).Value = $"📈 Vinst: {pc.Price - pc.ComponentsTotalCost} kr";
                worksheet.Cell(row++, 1).Value = $"📅 Listad: {pc.ListedAt:yyyy-MM-dd}";
                worksheet.Cell(row++, 1).Value = $"✅ Såld: {(pc.SoldAt.HasValue ? pc.SoldAt.Value.ToString("yyyy-MM-dd") : "-")}";

                worksheet.Columns().AdjustToContents();
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            return File(
                stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "pcs-export.xlsx"
            );
        }     
    }
}
