import { useState } from 'react';
import api from '../api/axiosInstance';

const starterMessages = [
  {
    role: 'assistant',
    content: 'Hi! I can help with billing, products, stock, invoices, and dashboard questions.'
  }
];

export default function ChatAssistant({ variant = 'panel' }) {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const isFloating = variant === 'floating';

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const history = nextMessages.slice(0, -1).map((message) => ({
        role: message.role,
        content: message.content
      }));

      const response = await api.post('/chatbot/ask', {
        message: trimmed,
        history
      });

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: response.data.reply || 'No reply received.' }
      ]);
    } catch (err) {
      const message = err?.response?.data?.message || 'Chat assistant is unavailable right now.';
      setError(message);
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'I could not answer just now. Please try again in a moment.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isFloating ? 'chat-fab-wrap' : 'nextgen-side-card chat-assistant-card'}>
      {isFloating && (
        <button
          type="button"
          className={`chat-fab-trigger ${isOpen ? 'chat-fab-trigger-open' : ''}`}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="chat-fab-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span>Message</span>
          <span className="chat-fab-pill">Chatbot</span>
        </button>
      )}

      {(!isFloating || isOpen) && (
        <div className={isFloating ? 'chat-float-panel' : ''}>
          <div className="chat-assistant-head">
            <div>
              <h3>AI Assistant</h3>
              <p>Ask about billing workflow or stock insights.</p>
            </div>
            <div className="chat-assistant-head-actions">
              <span className="chat-assistant-badge">Gemini</span>
              {isFloating && (
                <button type="button" className="chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="chat-thread">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                {message.content}
              </div>
            ))}
            {loading && <div className="chat-bubble chat-bubble-assistant">Thinking...</div>}
          </div>

          {error && <div className="chat-error-msg">{error}</div>}

          <form className="chat-input-form" onSubmit={sendMessage}>
            <textarea
              className="chat-input"
              rows="3"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn-premium chat-send-btn" type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
