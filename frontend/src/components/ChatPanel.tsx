import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, MapPin, Loader2 } from 'lucide-react';
import { DestinationInfo } from '../App';

interface ChatPanelProps {
  onDestinationUpdate: (dest: DestinationInfo) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isDestination?: boolean;
}

export default function ChatPanel({ onDestinationUpdate }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: 'Hello! I am your Travel Experience Engine. Tell me what you are feeling like doing, and I will fly you to the perfect destination.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'user', text: userMessage }]);
    setLoading(true);
    setStatusAnnouncement('Analyzing your travel preferences...');

    try {
      const response = await axios.post('/api/chat', { thought: userMessage });
      const data = response.data;

      if (data.type === 'function_call') {
        const destInfo = data.data as DestinationInfo;
        onDestinationUpdate(destInfo);
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Let's fly to ${destInfo.destination_name}!\n\n${destInfo.rationale}`,
            isDestination: true,
          },
        ]);
        setStatusAnnouncement(`Destination found: ${destInfo.destination_name}. Map updated.`);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), sender: 'ai', text: data.data },
        ]);
        setStatusAnnouncement('AI responded.');
      }
    } catch (error) {
      console.error('Failed to communicate with AI', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' },
      ]);
      setStatusAnnouncement('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 relative">
      <div className="sr-only" aria-live="polite">
        {statusAnnouncement}
      </div>
      
      <div className="p-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-400" />
          Experience Engine
        </h1>
        <p className="text-slate-400 text-sm mt-1">Powered by Vertex AI & Gemini</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-600/80 text-white rounded-tr-sm border border-blue-500/30'
                  : 'bg-slate-800/80 text-slate-100 rounded-tl-sm border border-slate-700/50'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="I'm feeling adventurous but want great sushi..."
            aria-label="Travel thought input"
            className="w-full bg-slate-800/80 border border-slate-700 rounded-full py-3 pl-5 pr-14 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send thought"
            className="absolute right-2 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
