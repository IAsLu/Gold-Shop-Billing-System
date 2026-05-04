namespace Billing_System.Services.Chatbot;

public sealed record ChatMessageDto(string Role, string Content);

public sealed class ChatRequestDto
{
    public string Message { get; set; } = string.Empty;
    public List<ChatMessageDto> History { get; set; } = [];
}

public sealed record ChatResponseDto(string Reply);
