using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Billing_System.Services.Chatbot;

public class GeminiChatService : IGeminiChatService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly HttpClient _httpClient;
    private readonly GeminiOptions _options;
    private readonly ILogger<GeminiChatService> _logger;

    public GeminiChatService(HttpClient httpClient, IOptions<GeminiOptions> options, ILogger<GeminiChatService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string> GenerateReplyAsync(
        string message,
        IReadOnlyList<ChatMessageDto>? history,
        string? dbContext,
        CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
            throw new InvalidOperationException("Gemini chat is not enabled.");

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException("Gemini API key is not configured.");

        var contents = BuildContents(message, history);

        contents.Insert(0, new
        {
            role = "user",
            parts = new[]
            {
                new { text = BuildSystemText(_options.SystemPrompt, dbContext) }
        }
        });

        var payload = new
        {
            contents,
            generationConfig = new
            {
                temperature = 0.7,
                topP = 0.9,
                maxOutputTokens = 512
            }
        };

        HttpRequestMessage request = new HttpRequestMessage(
            HttpMethod.Post,
            $"https://generativelanguage.googleapis.com/v1/models/{_options.Model}:generateContent?key={Uri.EscapeDataString(_options.ApiKey)}")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json")
        };

        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Gemini request failed with status {StatusCode}: {Body}", response.StatusCode, body);
            throw new InvalidOperationException($"Gemini request failed: {(int)response.StatusCode} - {body}");
        }

        using var document = JsonDocument.Parse(body);

        var reply = document.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return string.IsNullOrWhiteSpace(reply)
            ? "I could not generate a response right now."
            : reply.Trim();
    }

    private static string BuildSystemText(string systemPrompt, string? dbContext)
    {
        var basePrompt = string.IsNullOrWhiteSpace(systemPrompt)
            ? "You are a helpful assistant."
            : systemPrompt.Trim();

        if (string.IsNullOrWhiteSpace(dbContext))
            return $"System: {basePrompt}";

        return $"System: {basePrompt}\n\n{dbContext.Trim()}";
    }

    private static List<object> BuildContents(string message, IReadOnlyList<ChatMessageDto>? history)
    {
        var items = new List<object>();

        if (history is not null)
        {
            foreach (var entry in history
                         .Where(h => !string.IsNullOrWhiteSpace(h.Content))
                         .TakeLast(10))
            {
                items.Add(new
                {
                    role = NormalizeRole(entry.Role),
                    parts = new[]
                    {
                        new { text = entry.Content.Trim() }
                    }
                });
            }
        }

        items.Add(new
        {
            role = "user",
            parts = new[]
            {
                new { text = message.Trim() }
            }
        });

        return [.. items];
    }

    private static string NormalizeRole(string? role) =>
        string.Equals(role, "assistant", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, "model", StringComparison.OrdinalIgnoreCase)
            ? "model"
            : "user";
}
