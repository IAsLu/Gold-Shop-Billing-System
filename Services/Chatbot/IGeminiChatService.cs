namespace Billing_System.Services.Chatbot;

public interface IGeminiChatService
{
    Task<string> GenerateReplyAsync(string message, IReadOnlyList<ChatMessageDto>? history, string? dbContext, CancellationToken cancellationToken);
}
