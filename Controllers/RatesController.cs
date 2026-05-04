using Billing_System.Data;
using Billing_System.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Billing_System.Controllers;

[Route("api/[controller]")]
[ApiController]
public sealed class RatesController : ControllerBase
{
    private readonly AppDbContext _db;

    public RatesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("latest")]
    public async Task<ActionResult<GoldRate>> GetLatest(CancellationToken cancellationToken)
    {
        var latest = await _db.GoldRates
            .AsNoTracking()
            .OrderByDescending(r => r.EffectiveAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (latest == null)
            return NotFound(new { message = "No rates configured." });

        return Ok(latest);
    }

    [HttpGet]
    public async Task<ActionResult<List<GoldRate>>> GetAll([FromQuery] int take = 30, CancellationToken cancellationToken = default)
    {
        var limit = Math.Clamp(take, 1, 365);
        var rows = await _db.GoldRates
            .AsNoTracking()
            .OrderByDescending(r => r.EffectiveAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return Ok(rows);
    }

    [HttpPost]
    public async Task<ActionResult<GoldRate>> Create([FromBody] CreateRateRequest request, CancellationToken cancellationToken)
    {
        var entity = new GoldRate
        {
            EffectiveAt = request.EffectiveAt ?? DateTime.UtcNow,
            Rate24KPerGram = request.Rate24KPerGram,
            Rate22KPerGram = request.Rate22KPerGram,
            Rate18KPerGram = request.Rate18KPerGram,
            SilverRatePerGram = request.SilverRatePerGram,
            Buyback24KPerGram = request.Buyback24KPerGram,
            Buyback22KPerGram = request.Buyback22KPerGram,
            Buyback18KPerGram = request.Buyback18KPerGram
        };

        _db.GoldRates.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetLatest), new { id = entity.Id }, entity);
    }

    [HttpGet("live")]
    public async Task<IActionResult> GetLiveRates()
    {
        try
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("x-access-token", "goldapi-954f295677eae47702ebf6a71e8db0c0-io");
            var response = await client.GetAsync("https://www.goldapi.io/api/XAU/INR");
            
            if (!response.IsSuccessStatusCode)
                return BadRequest(new { message = "Failed to fetch live rates from GoldAPI" });

            var content = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
            
            // GoldAPI provides international spot prices. 
            // Tamil Nadu local retail rates typically include import duties (~6-10%) and local premiums.
            // Applying an estimated 8.5% premium to align closer with TN retail.
            decimal premiumMultiplier = 1.085m; 
            
            var spot24k = content.GetProperty("price_gram_24k").GetDecimal();
            var spot22k = content.GetProperty("price_gram_22k").GetDecimal();
            var spot18k = content.GetProperty("price_gram_18k").GetDecimal();

            return Ok(new
            {
                rate24KPerGram = Math.Round(spot24k * premiumMultiplier, 2),
                rate22KPerGram = Math.Round(spot22k * premiumMultiplier, 2),
                rate18KPerGram = Math.Round(spot18k * premiumMultiplier, 2),
                isLive = true
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching live rates", details = ex.Message });
        }
    }
}

public sealed record CreateRateRequest(
    decimal Rate24KPerGram,
    decimal Rate22KPerGram,
    decimal Rate18KPerGram,
    decimal? SilverRatePerGram,
    decimal? Buyback24KPerGram,
    decimal? Buyback22KPerGram,
    decimal? Buyback18KPerGram,
    DateTime? EffectiveAt);

