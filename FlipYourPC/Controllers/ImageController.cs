using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using FlipYourPC.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace FlipYourPC.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;

        public ImageController(IOptions<CloudinarySettings> config)
        {
            var settings = config.Value;
            var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);
            _cloudinary = new Cloudinary(account);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Ingen fil mottagen." });

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, file.OpenReadStream()),
                Folder = "flipyourpc",
                UseFilename = true,
                UniqueFilename = false,
                Overwrite = false
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            Console.WriteLine(result.SecureUrl);
            Console.WriteLine(result.Error?.Message);

            if (result.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return Ok(new
                {
                    url = result.SecureUrl.ToString(),
                    publicId = result.PublicId
                });
            }

            return StatusCode(500, new { message = "Uppladdning misslyckades." });
        }
    }
}
