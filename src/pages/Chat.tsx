import { useState, useRef, useEffect } from 'react';
import { useCriticStore } from '../store/criticStore';
import { chatWithTherapistStream, getApiKey, deconstructMessage } from '../services/openrouter';
import { Send, Loader2, Settings, Trash2, Search, X, MessageCircle, Heart, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChatMessage, DeconstructionAnalysis, CriticPatternType } from '../types/critic';

// Pattern type to display name mapping
const patternLabels: Record<CriticPatternType, string> = {
  'labeling': 'Labeling',
  'comparison': 'Comparison',
  'catastrophizing': 'Catastrophizing',
  'should-tyranny': 'Should-Tyranny',
  'mind-reading': 'Mind-Reading',
  'overgeneralization': 'Overgeneralization',
  'discounting-positives': 'Discounting Positives',
  'emotional-reasoning': 'Emotional Reasoning',
  'personalization': 'Personalization',
};

export function Chat() {
  const { critic, chatHistory, addChatMessage, updateMessageContent, clearChat, updateMessageAnalysis } = useCriticStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<{
    messageId: string;
    analysis: DeconstructionAnalysis;
  } | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getApiKey().then((key) => setHasApiKey(!!key));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    addChatMessage({ role: 'user', content: userMessage });
    setIsLoading(true);

    // Create an empty assistant message that we'll stream into
    const assistantMessage = addChatMessage({ role: 'assistant', content: '' });
    setStreamingMessageId(assistantMessage.id);

    const conversationHistory = chatHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    let accumulatedContent = '';

    await chatWithTherapistStream(
      critic,
      conversationHistory,
      userMessage,
      // onChunk - append each chunk to the message
      (chunk) => {
        accumulatedContent += chunk;
        updateMessageContent(assistantMessage.id, accumulatedContent);
      },
      // onComplete
      (fullMessage) => {
        updateMessageContent(assistantMessage.id, fullMessage);
        setIsLoading(false);
        setStreamingMessageId(null);
      },
      // onError
      (err) => {
        setError(err.message);
        setIsLoading(false);
        setStreamingMessageId(null);
      }
    );
  };

  const handleDeconstruct = async (message: ChatMessage) => {
    if (isAnalyzing || message.role !== 'user') return;

    // If already analyzed, just show the existing analysis
    if (message.analysis) {
      setActiveAnalysis({
        messageId: message.id,
        analysis: message.analysis,
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await deconstructMessage(critic, message.content);
      analysis.messageId = message.id;

      // Store the analysis in the message
      updateMessageAnalysis(message.id, analysis);

      setActiveAnalysis({
        messageId: message.id,
        analysis,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze message');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const closeAnalysis = () => {
    setActiveAnalysis(null);
    setHoveredSegment(null);
  };

  // Render message content with highlighted critic segments
  const renderHighlightedContent = (message: ChatMessage) => {
    if (!activeAnalysis || activeAnalysis.messageId !== message.id) {
      return message.content;
    }

    const { analysis } = activeAnalysis;
    if (!analysis.criticSegments.length) {
      return message.content;
    }

    // Sort segments by start index
    const sortedSegments = [...analysis.criticSegments].sort((a, b) => a.startIndex - b.startIndex);

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedSegments.forEach((segment) => {
      // Add text before this segment
      if (segment.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {message.content.slice(lastIndex, segment.startIndex)}
          </span>
        );
      }

      // Add the highlighted segment
      parts.push(
        <span
          key={segment.id}
          className={`relative inline critic-highlight cursor-pointer transition-all duration-200 ${
            hoveredSegment === segment.id
              ? 'bg-blue-300 decoration-blue-600'
              : 'bg-blue-100 decoration-blue-400'
          }`}
          style={{
            textDecoration: 'underline',
            textDecorationStyle: 'wavy',
            textDecorationThickness: '2px',
            textUnderlineOffset: '3px',
          }}
          onMouseEnter={() => setHoveredSegment(segment.id)}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          {segment.text}
        </span>
      );

      lastIndex = segment.endIndex;
    });

    // Add remaining text
    if (lastIndex < message.content.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {message.content.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  if (hasApiKey === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="brutal-card bg-brutal-yellow text-center">
          <Settings className="w-16 h-16 mx-auto mb-4" strokeWidth={2} />
          <h2 className="text-2xl font-black uppercase mb-4">API Key Required</h2>
          <p className="font-medium mb-6">
            To start a conversation, you need to add your OpenRouter API key.
          </p>
          <Link to="/settings" className="brutal-btn-primary inline-flex items-center gap-2">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  // Find the last user message for deconstruction
  const lastUserMessage = [...chatHistory].reverse().find((m) => m.role === 'user');

  return (
    <div className="h-[calc(100vh-120px)] flex">
      {/* Main Chat Container */}
      <div
        ref={chatContainerRef}
        className={`flex-1 flex flex-col transition-all duration-300 ${
          activeAnalysis ? 'mr-[400px]' : ''
        }`}
      >
        {/* Chat Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b-4 border-brutal-black bg-brutal-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 brutal-border border-2 bg-brutal-green flex items-center justify-center">
              <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase">Inner Work</h1>
              <p className="text-xs font-bold text-brutal-black/60">Therapeutic Companion</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Clear all conversation history?')) {
                clearChat();
                setActiveAnalysis(null);
              }
            }}
            className="p-2 brutal-border border-2 bg-brutal-white brutal-hover"
            title="Clear conversation"
          >
            <Trash2 className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-[#FAF9F7] px-6 py-4">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 brutal-border border-2 bg-brutal-green flex items-center justify-center mb-6">
                <Heart className="w-10 h-10" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-black uppercase mb-2">Welcome</h2>
              <p className="font-medium text-brutal-black/70 max-w-md">
                This is a safe space for self-reflection. Share what's on your mind,
                and I'll be here to listen and explore with you.
              </p>
              {critic && (
                <p className="font-medium text-brutal-black/50 text-sm mt-4 max-w-md">
                  I'm aware of your inner critic "{critic.personality.name}" and will help you
                  recognize when it might be speaking.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] brutal-border border-2 p-4 ${
                      message.role === 'user'
                        ? 'bg-brutal-blue'
                        : 'bg-brutal-white'
                    } ${
                      activeAnalysis?.messageId === message.id
                        ? 'ring-4 ring-blue-400 ring-offset-2'
                        : ''
                    }`}
                  >
                    <p className="font-black uppercase text-xs mb-2 text-brutal-black/60">
                      {message.role === 'user' ? 'You' : 'Companion'}
                    </p>
                    <p className="font-medium leading-relaxed">
                      {message.role === 'user'
                        ? renderHighlightedContent(message)
                        : message.content
                      }
                      {streamingMessageId === message.id && (
                        <span className="inline-block w-2 h-5 bg-brutal-black animate-pulse ml-0.5 align-middle" />
                      )}
                    </p>

                    {/* Analysis indicator for user messages */}
                    {message.role === 'user' && message.analysis && (
                      <button
                        onClick={() => handleDeconstruct(message)}
                        className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Search className="w-3 h-3" />
                        {message.analysis.criticSegments.length} pattern{message.analysis.criticSegments.length !== 1 ? 's' : ''} found
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-brutal-white border-t-4 border-brutal-black px-6 py-4">
          {error && (
            <div className="mb-4 p-3 brutal-border border-2 bg-brutal-red text-brutal-white font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 max-w-2xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Share what's on your mind..."
              className="flex-1 brutal-input min-h-[60px] max-h-[150px] resize-none"
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

          {/* Deconstruct Button */}
          {lastUserMessage && !activeAnalysis && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handleDeconstruct(lastUserMessage)}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 px-6 py-3 brutal-border border-2 font-bold transition-all ${
                  isAnalyzing
                    ? 'bg-brutal-gray cursor-not-allowed'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" strokeWidth={2.5} />
                    Deconstruct
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Panel - slides in from right */}
      {activeAnalysis && (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-brutal-white border-l-4 border-brutal-black overflow-y-auto shadow-brutal z-50 animate-slide-in-right">
          {/* Panel Header */}
          <div className="sticky top-0 bg-brutal-white border-b-4 border-brutal-black px-4 py-3 flex justify-between items-center">
            <h2 className="font-black uppercase">Analysis</h2>
            <button
              onClick={closeAnalysis}
              className="p-2 brutal-border border-2 bg-brutal-white brutal-hover"
            >
              <X className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Critic Segments */}
            {activeAnalysis.analysis.criticSegments.length > 0 ? (
              <>
                <div className="brutal-border border-2 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-black uppercase text-blue-800">Inner Critic</h3>
                  </div>

                  <div className="space-y-3">
                    {activeAnalysis.analysis.criticSegments.map((segment) => (
                      <div
                        key={segment.id}
                        className={`p-3 brutal-border border-2 bg-white transition-all duration-200 ${
                          hoveredSegment === segment.id ? 'ring-2 ring-blue-400' : ''
                        }`}
                        onMouseEnter={() => setHoveredSegment(segment.id)}
                        onMouseLeave={() => setHoveredSegment(null)}
                      >
                        <p className="font-bold italic mb-2">"{segment.text}"</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-black uppercase rounded">
                            {patternLabels[segment.patternType] || segment.patternType}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-brutal-black/70">
                          {segment.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Healthy Adult Response */}
                {activeAnalysis.analysis.healthyAdultResponse && (
                  <div className="brutal-border border-2 bg-green-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="font-black uppercase text-green-800">Healthy Adult</h3>
                    </div>
                    <div className="brutal-border border-2 bg-white p-3">
                      <p className="font-medium leading-relaxed">
                        {activeAnalysis.analysis.healthyAdultResponse}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 brutal-border border-2 bg-brutal-green flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8" strokeWidth={2} />
                </div>
                <h3 className="font-black uppercase mb-2">No Critic Patterns Found</h3>
                <p className="font-medium text-brutal-black/60 text-sm">
                  This message doesn't appear to contain obvious inner critic language.
                  That's great - it sounds like you're speaking from a grounded place.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
