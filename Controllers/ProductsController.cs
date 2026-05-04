using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Billing_System.Data;
using Billing_System.Models;

namespace Billing_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProductsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/Products
        // For gold billing, this endpoint represents tag-wise stock items.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StockTag>>> GetProducts()
        {
            return await _context.StockTags
                .OrderByDescending(x => x.Id)
                .ToListAsync();
        }

        // GET: api/Products/latest?count=6
        // Returns the most recently created products that have images.
        [HttpGet("latest")]
        public async Task<ActionResult<IEnumerable<StockTag>>> GetLatestProducts([FromQuery] int count = 6)
        {
            var take = Math.Clamp(count, 1, 24);

            var products = await _context.StockTags
                .AsNoTracking()
                .Where(p => p.ImageUrl != null && p.ImageUrl != "")
                .OrderByDescending(p => p.Id)
                .Take(take)
                .ToListAsync();

            return products;
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StockTag>> GetProduct(int id)
        {
            var product = await _context.StockTags.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromBody] StockTag product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            if (product.Quantity > 0 && product.Status == StockStatus.Sold)
            {
                product.Status = StockStatus.Available;
            }
            else if (product.Quantity <= 0)
            {
                product.Quantity = 0;
                product.Status = StockStatus.Sold;
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Products
        [HttpPost]
        public async Task<ActionResult<StockTag>> PostProduct([FromBody] StockTag product)
        {
            if (product.NetWeightG <= 0)
                product.NetWeightG = Math.Max(0, product.GrossWeightG - product.StoneWeightG);

            if (product.Quantity > 0 && product.Status == StockStatus.Sold)
            {
                product.Status = StockStatus.Available;
            }
            else if (product.Quantity <= 0)
            {
                product.Quantity = 0;
                product.Status = StockStatus.Sold;
            }

            _context.StockTags.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProduct", new { id = product.Id }, product);
        }

        // POST: api/Products/5/image
        [HttpPost("{id}/image")]
        [RequestSizeLimit(10_000_000)] // 10 MB
        public async Task<ActionResult> UploadProductImage(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var product = await _context.StockTags.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            var ext = Path.GetExtension(file.FileName);
            var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };
            if (string.IsNullOrWhiteSpace(ext) || !allowed.Contains(ext))
                return BadRequest(new { message = "Only .jpg, .jpeg, .png, .webp are allowed" });

            String uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "stock");
            Directory.CreateDirectory(uploadsDir);

            String fileName = $"{id}_{Guid.NewGuid():N}{ext}";
            String diskPath = Path.Combine(uploadsDir, fileName);

            await using (var stream = System.IO.File.Create(diskPath))
            {
                await file.CopyToAsync(stream);
            }

            product.ImageUrl = $"/uploads/stock/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { imageUrl = product.ImageUrl });
        }

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.StockTags.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.StockTags.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.StockTags.Any(e => e.Id == id);
        }
    }
}
