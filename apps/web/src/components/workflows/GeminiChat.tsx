import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Loader2 } from 'lucide-react';
import { Node, Edge } from 'reactflow';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  onClose: () => void;
  onWorkflowGenerated: (nodes: Node[], edges: Edge[]) => void;
}

export default function GeminiChat({ onClose, onWorkflowGenerated }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your AI workflow assistant. Describe the workflow you want to create, and I'll help you build it!\n\n💡 **AI Models Available:**\n• Default: Gemini (Google AI)\n• Advanced: @dedalus (Dedalus AI with GPT-4)\n\n**Examples:**\n• 'Create a workflow that sends a Slack message when a new Jira issue is created'\n• '@dedalus Build a complex workflow to sync GitHub issues with Jira and notify on Teams'\n• 'Make a workflow that sends email summaries of calendar events'\n\nJust mention @dedalus in your message to use advanced AI!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/workflows/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.explanation || 'I created a workflow based on your description!',
          },
        ]);

        // Apply the generated workflow to the canvas
        if (data.nodes && data.edges) {
          onWorkflowGenerated(data.nodes, data.edges);
        }
      } else {
        throw new Error('Failed to generate workflow');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm sorry, I encountered an error generating the workflow. Please make sure the Gemini API is configured and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold">AI Workflow Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span className="text-sm text-gray-300">Generating workflow...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your workflow..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
