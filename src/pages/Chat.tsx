import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCriticStore } from '../store/criticStore';
import { chatWithCritic, getApiKey, generateHealthyAdultResponse } from '../services/openrouter';
import { Send, Loader2, Settings, Trash2, Shield, Heart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChatMessage } from '../types/critic';

export function Chat() {
  const navigate = useNavigate();
  const { critic, chatHistory, addChatMessage, clearChat } = useCriticStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingShieldId, setLoadingShieldId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [healthyAdultResponses, setHealthyAdultResponses] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getApiKey().then((key) => setHasApiKey(!!key));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, healthyAdultResponses]);

  if (!critic) {
    navigate('/');
    return null;
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    addChatMessage({ role: 'user', content: userMessage });
    setIsLoading(true);

    try {
      const conversationHistory = chatHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

      const response = await chatWithCritic(critic, conversationHistory, userMessage);
      addChatMessage({ role: 'critic', content: response });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShieldClick = async (criticMessage: ChatMessage) => {
    if (loadingShieldId || healthyAdultResponses[criticMessage.id]) return;

    setLoadingShieldId(criticMessage.id);
    setError(null);

    const messageIndex = chatHistory.findIndex((m) => m.id === criticMessage.id);
    const precedingUserMessage = chatHistory
      .slice(0, messageIndex)
      .reverse()
      .find((m) => m.role === 'user');

    try {
      const response = await generateHealthyAdultResponse(
        critic,
        criticMessage.content,
        precedingUserMessage?.content || ''
      );
      setHealthyAdultResponses((prev) => ({
        ...prev,
        [criticMessage.id]: response,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get Healthy Adult response');
    } finally {
      setLoadingShieldId(null);
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="brutal-card bg-brutal-yellow text-center">
          <Settings className="w-16 h-16 mx-auto mb-4" strokeWidth={2} />
          <h2 className="text-2xl font-black uppercase mb-4">API Key Required</h2>
          <p className="font-medium mb-6">
            To chat with your inner critic, you need to add your OpenRouter API key in the settings.
          </p>
          <Link to="/settings" className="brutal-btn-primary inline-flex items-center gap-2">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  // Get the latest critic message for the main display
  const latestCriticMessage = [...chatHistory].reverse().find((m) => m.role === 'critic');
  const latestHealthyAdultResponse = latestCriticMessage
    ? healthyAdultResponses[latestCriticMessage.id]
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Scene Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black uppercase">The Conversation</h1>
        <button
          onClick={() => {
            if (confirm('Clear all conversation history?')) {
              clearChat();
              setHealthyAdultResponses({});
            }
          }}
          className="p-2 brutal-border border-2 bg-brutal-white brutal-hover"
          title="Clear conversation"
        >
          <Trash2 className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Main Scene Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Inner Critic Character */}
        <div className="lg:col-span-1">
          <div className="brutal-card bg-brutal-pink sticky top-24">
            {/* Critic Avatar */}
            <div className="aspect-square brutal-border bg-brutal-white mb-4 overflow-hidden">
              {critic.appearance.imageUrl ? (
                <img
                  src={critic.appearance.imageUrl}
                  alt={critic.personality.name || 'Your inner critic'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brutal-gray">
                  <User className="w-16 h-16" strokeWidth={1.5} />
                </div>
              )}
            </div>

            {/* Critic Name & Info */}
            <h2 className="text-xl font-black uppercase mb-1">
              {critic.personality.name || 'The Critic'}
            </h2>
            <p className="font-medium text-sm text-brutal-black/70 mb-4">
              {critic.personality.voice || 'Critical voice'}
            </p>

            {/* Current Speech Bubble */}
            {latestCriticMessage && (
              <div className="relative">
                {/* Speech bubble pointer */}
                <div className="absolute -top-2 left-6 w-4 h-4 bg-brutal-white brutal-border border-2 rotate-45 z-0" />

                <div className="brutal-border border-2 bg-brutal-white p-4 relative z-10">
                  <p className="font-bold italic">"{latestCriticMessage.content}"</p>
                </div>

                {/* Shield button */}
                {!latestHealthyAdultResponse && (
                  <button
                    onClick={() => handleShieldClick(latestCriticMessage)}
                    disabled={loadingShieldId === latestCriticMessage.id}
                    className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 brutal-border border-2 font-bold brutal-hover ${
                      loadingShieldId === latestCriticMessage.id
                        ? 'bg-brutal-gray'
                        : 'bg-brutal-green'
                    }`}
                  >
                    {loadingShieldId === latestCriticMessage.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Summoning protection...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" strokeWidth={2.5} />
                        Activate Healthy Adult
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {isLoading && (
              <div className="brutal-border border-2 bg-brutal-white p-4 mt-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium italic">The critic is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Your space + Healthy Adult */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Healthy Adult Response (when active) */}
          {latestHealthyAdultResponse && (
            <div className="brutal-card bg-brutal-green mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 brutal-border border-2 bg-brutal-white flex items-center justify-center">
                  <Heart className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-black uppercase">Healthy Adult</h3>
                  <p className="text-xs font-bold text-brutal-black/60 uppercase">
                    Protecting your inner child
                  </p>
                </div>
              </div>
              <div className="brutal-border border-2 bg-brutal-white p-4">
                <p className="font-medium">{latestHealthyAdultResponse}</p>
              </div>
            </div>
          )}

          {/* Conversation History */}
          <div className="brutal-card bg-brutal-blue flex-1 mb-6">
            <h3 className="font-black uppercase mb-4">Your Thoughts</h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-bold mb-2">Share what's on your mind</p>
                  <p className="font-medium text-brutal-black/60 text-sm">
                    Type below to start a dialogue with your inner critic.
                    <br />
                    When it responds, you can activate your Healthy Adult for protection.
                  </p>
                </div>
              ) : (
                chatHistory.map((message) => {
                  if (message.role === 'user') {
                    return (
                      <div key={message.id} className="brutal-border border-2 bg-brutal-white p-3">
                        <p className="font-medium">{message.content}</p>
                      </div>
                    );
                  }
                  return null;
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="brutal-card bg-brutal-yellow">
            <label className="block font-black uppercase text-sm mb-2">
              What would you like to say?
            </label>
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Express your thoughts, fears, or doubts..."
                className="flex-1 brutal-input min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`brutal-btn self-end ${
                  isLoading || !input.trim()
                    ? 'bg-brutal-gray cursor-not-allowed'
                    : 'bg-brutal-white'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 brutal-border bg-brutal-red text-brutal-white font-bold">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Conversation History (expandable) */}
      {chatHistory.length > 2 && (
        <details className="mt-6">
          <summary className="cursor-pointer font-black uppercase text-sm mb-3 hover:text-brutal-black/70">
            View Full Conversation History ({chatHistory.length} messages)
          </summary>
          <div className="brutal-card bg-brutal-white">
            <div className="space-y-3">
              {chatHistory.map((message) => {
                const healthyAdult = message.role === 'critic' ? healthyAdultResponses[message.id] : null;

                return (
                  <div key={message.id}>
                    <div
                      className={`p-3 brutal-border border-2 ${
                        message.role === 'user' ? 'bg-brutal-blue' : 'bg-brutal-pink'
                      }`}
                    >
                      <p className="font-black uppercase text-xs mb-1">
                        {message.role === 'user' ? 'You' : critic.personality.name || 'Critic'}
                      </p>
                      <p className="font-medium text-sm">{message.content}</p>
                    </div>

                    {healthyAdult && (
                      <div className="ml-8 mt-2 p-3 brutal-border border-2 bg-brutal-green">
                        <p className="font-black uppercase text-xs mb-1">Healthy Adult</p>
                        <p className="font-medium text-sm">{healthyAdult}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
