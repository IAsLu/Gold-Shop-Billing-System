using Billing_System.Services.Chatbot;
using Microsoft.AspNetCore.Mvc;

namespace Billing_System.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ChatbotController : ControllerBase
{
    private readonly IGeminiChatService _geminiChatService;
    private readonly IChatbotDataContext _dataContext;

    public ChatbotController(IGeminiChatService geminiChatService, IChatbotDataContext dataContext)
    {
        _geminiChatService = geminiChatService;
        _dataContext = dataContext;
    }

    [HttpPost("ask")]
    public async Task<ActionResult<ChatResponseDto>> Ask([FromBody] ChatRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Message is required." });

        try
        {
            // 1) DB direct answer
            var dbOnly = await _dataContext.TryAnswerFromDbAsync(request.Message, cancellationToken);
            if (!string.IsNullOrWhiteSpace(dbOnly))
                return Ok(new ChatResponseDto(dbOnly));

            // 2) Build detailed DB context
            var context = await _dataContext.BuildContextAsync(request.Message, cancellationToken);

            // 3) Pass context to Gemini
            var reply = await _geminiChatService.GenerateReplyAsync(
                request.Message,
                request.History,
                context,
                cancellationToken);

            return Ok(new ChatResponseDto(reply));
        }
        catch (InvalidOperationException)
        {
            var fallback = await _dataContext.TryAnswerFromDbAsync(request.Message, cancellationToken)
                           ?? "AI assistant is unavailable right now.";
            return Ok(new ChatResponseDto(fallback));
        }
    }
}
