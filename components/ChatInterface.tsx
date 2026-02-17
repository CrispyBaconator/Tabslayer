
import React from 'react';
import { ChatMessage, LinkItem } from '../types';
import { queryLinks } from '../services/geminiService';

interface ChatInterfaceProps {
  links: LinkItem[];
  theme: 'dark' | 'light' | 'oled' | 'cute';
  onHighlightLinks: (ids: string[]) => void;
  onToggle: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ links, theme, onHighlightLinks, onToggle }) => {
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await queryLinks(input, links);
      const aiMsg: ChatMessage = {
        role: 'model',
        text: result.answer,
        timestamp: Date.now(),
        relatedLinkIds: result.relatedLinkIds
      };
      setMessages(prev => [...prev, aiMsg]);
      if (result.relatedLinkIds && result.relatedLinkIds.length > 0) {
        onHighlightLinks(result.relatedLinkIds);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I had trouble scanning the vault context. Check your link status.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const bubbleStyles = {
    user: theme === 'cute' ? 'bg-rose-400 text-white' : 'bg-indigo-600 text-white',
    model: theme === 'light' ? 'bg-slate-100 text-slate-900 border-slate-200' : theme === 'cute' ? 'bg-white text-rose-900 border-rose-100' : 'bg-slate-900 text-slate-200 border-slate-800'
  };

  return (
    <div className="flex flex-col h-full backdrop-blur-md">
      <div className={`px-8 py-6 border-b flex items-center justify-between ${theme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
        <div>
          <h3 className={`font-black text-[10px] flex items-center gap-2 tracking-[0.2em] uppercase ${theme === 'cute' ? 'text-rose-400' : 'text-indigo-400'}`}>
            Intelligence
          </h3>
          <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-black opacity-50">Gemini 3 Flash</p>
        </div>
        <button onClick={onToggle} className="text-slate-600 hover:text-slate-400 p-2">
           <i className="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-6 border-2 border-dashed ${theme === 'cute' ? 'border-rose-200 text-rose-300' : 'border-indigo-500/20 text-indigo-500'}`}>
              <i className="fas fa-brain text-xl"></i>
            </div>
            <p className="font-black text-[9px] uppercase tracking-[0.3em]">Query your vault</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-5 rounded-[1.5rem] text-[11px] leading-relaxed border ${msg.role === 'user' ? 'rounded-br-none border-transparent' : 'rounded-bl-none'} ${bubbleStyles[msg.role]}`}>
              {msg.text}
              {msg.relatedLinkIds && msg.relatedLinkIds.length > 0 && (
                <div className="mt-4 pt-3 border-t border-black/5 text-[8px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                  <i className="fas fa-link text-[7px]"></i>
                  {msg.relatedLinkIds.length} references highlighted
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className={`p-5 rounded-[1.5rem] rounded-bl-none border ${bubbleStyles.model}`}>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500/40 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500/40 rounded-full animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500/40 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-8 border-t ${theme === 'light' ? 'bg-white border-slate-100' : 'border-slate-900'}`}>
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your links..."
            className={`w-full border rounded-2xl pl-5 pr-14 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all ${theme === 'cute' ? 'bg-white border-rose-100 text-rose-900 focus:border-rose-300' : theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-200 focus:border-indigo-500/50'}`}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme === 'cute' ? 'bg-rose-400 shadow-lg shadow-rose-400/20' : 'bg-indigo-600 shadow-lg shadow-indigo-600/20'} text-white text-[10px]`}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
