namespace Billing_System.Services.Chatbot;

public class GeminiOptions
{
    public bool Enabled { get; set; }
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gemini-1.5-flash";
    public string SystemPrompt { get; set; } =
        "You are a helpful billing assistant for a textile billing system. Give concise, practical answers.";
}
