import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, WifiOff, Bot, User as UserIcon, Trash2, Loader } from 'lucide-react';
import { Tab, Product, User, TabStatus } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

interface Props {
  uid: string;
  businessName: string;
  ownerName: string;
  tabs: Tab[];
  inventory: Product[];
  staff: User[];
  isOnline: boolean;
  isDemo?: boolean;
}

const AI_KEY = (typeof process !== 'undefined' ? process.env?.AI_INTEGRATIONS_GEMINI_API_KEY : undefined)
  || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined)
  || (import.meta as any).env?.VITE_AI_INTEGRATIONS_GEMINI_API_KEY
  || '';

function buildContext(businessName: string, tabs: Tab[], inventory: Product[], staff: User[]): string {
  const today = new Date().setHours(0, 0, 0, 0);
  const todayTabs = tabs.filter(t => (t.createdAt || 0) >= today);
  const paidToday = todayTabs.filter(t => String(t.status).toUpperCase() === TabStatus.PAID);
  const openTabs = tabs.filter(t => String(t.status).toUpperCase() === TabStatus.OPEN);
  const unpaidTabs = tabs.filter(t => String(t.status).toUpperCase() === TabStatus.UNPAID);
  const revenueToday = paidToday.reduce((s, t) => s + t.total, 0);
  const totalDebt = unpaidTabs.reduce((s, t) => s + t.total, 0);

  const topItems: Record<string, number> = {};
  tabs.forEach(t => t.items.forEach(i => {
    topItems[i.name] = (topItems[i.name] || 0) + i.quantity;
  }));
  const topSellersList = Object.entries(topItems)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => `${name} (${qty} sold)`)
    .join(', ');

  const staffSales: Record<string, number> = {};
  paidToday.forEach(t => { staffSales[t.staffId] = (staffSales[t.staffId] || 0) + t.total; });
  const staffPerf = staff
    .map(s => `${s.name} (${s.role}): KES ${(staffSales[s.id] || 0).toLocaleString()} today`)
    .join('; ');

  const lowStock = inventory.filter(i => i.stock < 10).map(i => `${i.name} (${i.stock} left)`).join(', ');

  return `You are a private business intelligence assistant for "${businessName}".
You help the owner understand their business data and make decisions. Be concise, friendly, and insightful.
Always respond in the same language as the question. Format numbers clearly.

Current Business Snapshot:
- Business: ${businessName}
- Date/Time: ${new Date().toLocaleString('en-KE')}
- Revenue today: KES ${revenueToday.toLocaleString()} from ${paidToday.length} paid transactions
- Open tabs: ${openTabs.length} worth KES ${openTabs.reduce((s, t) => s + t.total, 0).toLocaleString()}
- Outstanding debts: ${unpaidTabs.length} accounts, KES ${totalDebt.toLocaleString()} owed
- Total inventory items: ${inventory.length}
- Low stock alerts: ${lowStock || 'None'}
- Top selling items (all time): ${topSellersList || 'No data yet'}
- Staff performance today: ${staffPerf || 'No sales recorded yet'}
- Total staff: ${staff.length}

All amounts are in Kenyan Shillings (KES). Answer questions about this data confidently.`;
}

export const BIChat: React.FC<Props> = ({ uid, businessName, ownerName, tabs, inventory, staff, isOnline, isDemo }) => {
  const storageKey = `madis_bi_chat_${uid}`;
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(`madis_bi_chat_${uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(messages.slice(-50))); } catch {}
  }, [messages, storageKey]);

  const send = async () => {
    const q = input.trim();
    if (!q || isLoading) return;
    if (!isOnline) { setError('AI requires an internet connection.'); return; }

    setInput('');
    setError('');

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: q, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const ctx = buildContext(businessName, tabs, inventory, staff);
      const history = messages.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const ai = new GoogleGenAI({ apiKey: AI_KEY });
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: ctx },
        history,
      });
      const res = await chat.sendMessage({ message: q });
      const text = res.text || 'Sorry, I could not generate a response.';

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: 'assistant', content: text, ts: Date.now()
      }]);
    } catch (e: any) {
      setError(e?.message?.includes('API') ? 'API error — check your Gemini key.' : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  const suggested = [
    'What is my projected monthly revenue based on today\'s sales?',
    'Which items have the highest profit contribution?',
    'Which staff member should I consider promoting based on performance?',
    'What are my slowest-moving items and what should I do about them?',
    'Which hour of the day generates the most revenue?',
    'Give me a summary of this week\'s business health.',
    'How much is owed in debts and who are the biggest debtors?',
    'What\'s my average transaction value and how can I increase it?',
  ];

  return (
    <div className="flex flex-col h-full max-w-3xl pb-4">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black themed-text tracking-tighter flex items-center gap-3">
            <Sparkles size={22} className="text-[#4F6EF6]" />
            Business Intelligence
          </h2>
          <p className="themed-text-dim text-sm mt-1">
            Ask anything about your sales, stock, staff or debts. Private to you only.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs themed-text-dim hover:text-red-400 transition-colors px-3 py-2 rounded-xl border themed-border hover:border-red-400/20"
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </header>

      {/* Offline notice */}
      {!isOnline && (
        <div className="mb-4 flex items-center gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3">
          <WifiOff size={16} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-400/80">
            AI chat requires an internet connection. It will work once you're back online — your POS continues offline.
          </p>
        </div>
      )}

      {isDemo && (
        <div className="mb-4 flex items-center gap-3 bg-[#4F6EF6]/8 border border-[#4F6EF6]/20 rounded-xl px-4 py-3">
          <Sparkles size={16} className="text-[#4F6EF6] shrink-0" />
          <p className="text-sm text-[#4F6EF6]/80">
            Demo mode — AI chat is active and will answer questions about the demo data.
          </p>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar min-h-[280px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-14 h-14 bg-[#4F6EF6]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#4F6EF6]/15">
              <Sparkles size={24} className="text-[#4F6EF6]" />
            </div>
            <p className="font-bold themed-text mb-1">Your private AI analyst</p>
            <p className="text-xs themed-text-dim max-w-xs leading-relaxed">
              Ask questions about your business data in plain English. Your conversations are stored only on this device.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
              msg.role === 'user'
                ? 'bg-[#4F6EF6] text-white'
                : 'bg-white/6 border themed-border themed-text-dim'
            }`}>
              {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#4F6EF6] text-white rounded-tr-sm'
                  : 'themed-bg-secondary border themed-border themed-text rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
              <span className="text-[9px] themed-text-dim px-1">
                {new Date(msg.ts).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-white/6 border themed-border themed-text-dim">
              <Bot size={14} />
            </div>
            <div className="px-4 py-3 rounded-2xl themed-bg-secondary border themed-border rounded-tl-sm flex items-center gap-2">
              <Loader size={14} className="text-[#4F6EF6] animate-spin" />
              <span className="text-sm themed-text-dim">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mt-4 mb-3">
          {suggested.map(s => (
            <button
              key={s}
              onClick={() => { setInput(s); inputRef.current?.focus(); }}
              className="text-xs px-3 py-1.5 bg-white/4 border border-white/8 rounded-full themed-text-dim hover:border-[#4F6EF6]/30 hover:text-[#4F6EF6] transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 mb-2 px-1">{error}</p>
      )}

      {/* Input */}
      <div className="flex gap-3 mt-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          disabled={!isOnline || isLoading}
          placeholder={isOnline ? `Ask about ${businessName}...` : 'Waiting for internet connection...'}
          className="flex-1 bg-white/4 border border-white/8 rounded-xl py-3 px-4 themed-text placeholder-white/20 focus:outline-none focus:border-[#4F6EF6]/50 transition-all text-sm disabled:opacity-40"
        />
        <button
          onClick={send}
          disabled={!input.trim() || !isOnline || isLoading}
          className="w-11 h-11 bg-[#4F6EF6] text-white rounded-xl flex items-center justify-center hover:bg-[#3D5CE4] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(79,110,246,0.25)] shrink-0"
        >
          <Send size={16} />
        </button>
      </div>

      <p className="text-[9px] themed-text-dim text-center mt-3 opacity-40">
        Powered by August · Private to owner only · Conversation stored on this device
      </p>
    </div>
  );
};
