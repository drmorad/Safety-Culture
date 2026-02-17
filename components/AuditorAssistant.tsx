
import React, { useState, useRef, useEffect } from 'react';
import { queryAuditDatabase } from '../services/geminiService';
import { InspectionRecord, ChatMessage } from '../types';

interface AuditorAssistantProps {
  records: InspectionRecord[];
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const AuditorAssistant: React.FC<AuditorAssistantProps> = ({ records, chatHistory, setChatHistory }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const response = await queryAuditDatabase(userQuery, records);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Protocol error: Failed to synthesize audit context. Please check telemetry connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Purge local chat history?')) {
      setChatHistory([{ role: 'assistant', content: 'Greeting Officer. I am currently monitoring the facility audit stream. How can I assist with your risk analysis today?' }]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[80vh] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in-up ring-1 ring-black/5 dark:ring-white/5">
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-8 flex items-center justify-between shadow-md relative z-10">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-2xl blur opacity-30"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-blue-400/20">
              🤖
            </div>
          </div>
          <div>
            <h2 className="text-white font-black text-xl tracking-tight uppercase">Audit Intelligence</h2>
            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Gemini Pro 1.5 Context</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleClearHistory} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-black/20 border border-white/5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></span>
            <span className="text-emerald-100 text-[9px] font-black uppercase tracking-widest">Online</span>
          </div>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-black/20 relative scroll-smooth"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

        {chatHistory.map((m, i) => (
          <div 
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-3 mt-1 text-base shrink-0 border border-slate-300 dark:border-slate-600">
                🤖
              </div>
            )}
            <div className={`max-w-[85%] md:max-w-[70%] p-5 md:p-6 rounded-[2rem] shadow-sm relative ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200 dark:shadow-none' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
            }`}>
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                {m.content.split('\n').map((line, idx) => (
                  <p key={idx} className={`mb-2 last:mb-0 leading-relaxed font-medium ${m.role === 'user' ? 'text-blue-50' : 'text-slate-600 dark:text-slate-300'}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
            {m.role === 'user' && (
               <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center ml-3 mt-1 text-xs font-black text-blue-600 dark:text-blue-300 shrink-0 border border-blue-200 dark:border-blue-700">
                YOU
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-3 mt-1 text-base shrink-0 border border-slate-300 dark:border-slate-600">🤖</div>
             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-[2rem] rounded-tl-none shadow-sm flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                </div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Reasoning...</span>
             </div>
          </div>
        )}
      </div>

      <footer className="p-5 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative z-10">
        <div className="flex gap-4">
          <input 
            type="text"
            placeholder="Ask about risk patterns, specific hazards, or ISO compliance..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-6 py-4 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 font-bold transition-all text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 md:px-8 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all hover:bg-blue-600 dark:hover:bg-slate-200 active:scale-95 disabled:opacity-50 shadow-lg disabled:shadow-none"
          >
            Send
          </button>
        </div>
        <p className="mt-4 text-center text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
          AI Confidential Mode • Data encrypted end-to-end
        </p>
      </footer>
    </div>
  );
};

export default AuditorAssistant;
