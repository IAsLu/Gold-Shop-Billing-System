using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Billing_System.Services.WhatsApp;

public class WhatsAppClient : IWhatsAppClient
{
    private readonly HttpClient _http;
    private readonly WhatsAppOptions _options;

    public WhatsAppClient(HttpClient http, IOptions<WhatsAppOptions> options)
    {
        _http = http;
        _options = options.Value;
    }

    public async Task SendTextAsync(string toE164, string messageBody, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
            return;

        if (string.IsNullOrWhiteSpace(_options.AccessToken) || string.IsNullOrWhiteSpace(_options.PhoneNumberId))
            throw new InvalidOperationException("WhatsApp is enabled but AccessToken / PhoneNumberId is missing.");

        String url = $"https://graph.facebook.com/{_options.ApiVersion}/{_options.PhoneNumberId}/messages";

        using var req = new HttpRequestMessage(HttpMethod.Post, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.AccessToken);

        var payload = new
        {
            messaging_product = "whatsapp",
            to = toE164,
            type = "text",
            text = new { body = messageBody }
        };

        req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var res = await _http.SendAsync(req, cancellationToken);
        if (!res.IsSuccessStatusCode)
        {
            var body = await res.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"WhatsApp send failed ({(int)res.StatusCode}): {body}");
        }
    }
}

