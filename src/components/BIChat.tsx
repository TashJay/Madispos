import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Sparkles, WifiOff, Bot, User as UserIcon, Trash2,
  TrendingUp, Package, CreditCard, Users, ChevronRight, RotateCcw
} from 'lucide-react';
import { Tab, Product, User, TabStatus } from '../types';

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

function buildContext(businessName: string, tabs: Tab[], inventory: Product[], staff: User[]): string {
  const today = new Date().setHours(0, 0, 0, 0);
  const todayTabs = tabs.filter(t => (t.createdAt || 0) >= today);
  const paidToday = todayTabs.filter(t => String(t.status).toUpperCase() === TabStatus.PAID);
  const openTabs = tabs.filter(t => String(t.status).toUpperCase() === TabStatus.OPEN);
  const unpaidTabs = tabs.filter(t => String(t.status).toUpperCase() === TabStatus.UNPAID);
  const revenueToday = paidToday.reduce((s, t) => s + t.total, 0);
  const totalDebt = unpaidTabs.reduce((s, t) => s + t.total, 0);

  const topItems: Record<string, number> = {};
  tabs.forEach(t => t.items.forEach(i => { topItems[i.name] = (topItems[i.name] || 0) + i.quantity; }));
  const topSellersList = Object.entries(topItems).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, qty]) => `${name} (${qty})`).join(', ');

  const staffSales: Record<string, number> = {};
  paidToday.forEach(t => { staffSales[t.staffId] = (staffSales[t.staffId] || 0) + t.total; });
  const staffPerf = staff.map(s => `${s.name} (${s.role}): KES ${(staffSales[s.id] || 0).toLocaleString()} today`).join('; ');
  const lowStock = inventory.filter(i => i.stock < 10).map(i => `${i.name} (${i.stock} left)`).join(', ');

  return `You are Madison, a private business advisor for "${businessName}".
Help the owner understand their business data and make smart decisions. Be concise, friendly, and insightful.
Never mention your underlying technology or that you are an AI model. Just be Madison, their business advisor.
Respond in the same language as the question. Format numbers clearly. Use bullet points for lists.

Business Snapshot (${new Date().toLocaleString('en-KE')}):
- Revenue today: KES ${revenueToday.toLocaleString()} from ${paidToday.length} paid transactions
- Open tabs: ${openTabs.length} worth KES ${openTabs.reduce((s, t) => s + t.total, 0).toLocaleString()}
- Outstanding debts: ${unpaidTabs.length} accounts, KES ${totalDebt.toLocaleString()} owed
- Inventory: ${inventory.length} items total · Low stock: ${lowStock || 'None'}
- Top sellers (all time): ${topSellersList || 'No data yet'}
- Staff today: ${staffPerf || 'No sales yet'}

All amounts in Kenyan Shillings (KES). Answer confidently from this data.`;
}

function formatMessage(text: string): React.ReactNode {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-[#4F6EF6] mt-0.5 shrink-0">•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)/);
          return match ? (
            <div key={i} className="flex gap-2">
              <span className="text-[#4F6EF6] shrink-0 font-black text-xs mt-0.5">{match[1]}.</span>
              <span>{match[2]}</span>
            </div>
          ) : <div key={i}>{line}</div>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-black themed-text">{line.slice(2, -2)}</p>;
        }
        if (!line.trim()) return <div key={i} className="h-1" />;
        const boldRegex = /\*\*(.*?)\*\*/g;
        if (boldRegex.test(line)) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={i}>
              {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="font-black themed-text">{p}</strong> : p)}
            </p>
          );
        }
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

const SUGGESTED = [
  { label: "Today's revenue", q: "What is my revenue so far today and how does it compare to a typical day?" },
  { label: 'Top sellers', q: 'Which are my top 5 best-selling items and how much revenue do they generate?' },
  { label: 'Staff performance', q: 'How is each staff member performing today? Who should I consider for a bonus?' },
  { label: 'Low stock', q: 'Which items are running low and should I reorder urgently?' },
  { label: 'Debt summary', q: 'Give me a summary of all outstanding debts and who owes the most.' },
  { label: 'Growth tips', q: 'Based on my sales data, what 3 things can I do to grow my revenue this week?' },
  { label: 'Peak hours', q: 'What time of day generates the most sales? How should I staff accordingly?' },
  { label: 'Business health', q: 'Give me an overall health check of my business based on current data.' },
];

export const BIChat: React.FC<Props> = ({ uid, businessName, tabs, inventory, staff, isOnline, isDemo }) => {
  const storageKey = `madis_bi_chat_${uid}`;
  const [messages, setMessages] = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const today = new Date().setHours(0, 0, 0, 0);
  const paidToday = tabs.filter(t => (t.createdAt || 0) >= today && String(t.status).toUpperCase() === TabStatus.PAID);
  const revenueToday = paidToday.reduce((s, t) => s + t.total, 0);
  const openTabsCount = tabs.filter(t => String(t.status).toUpperCase() === TabStatus.OPEN).length;
  const debts = tabs.filter(t => String(t.status).toUpperCase() === TabStatus.UNPAID);
  const lowStockCount = inventory.filter(i => i.stock < 10).length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(messages.slice(-60))); } catch {}
  }, [messages, storageKey]);

  const send = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || isLoading) return;
    if (!isOnline) { setError('Madison requires an internet connection.'); return; }

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
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction: ctx, history, message: q }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'API request failed');
      }
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: 'assistant', content: data.text || 'No response received.', ts: Date.now()
      }]);
    } catch (e: any) {
      setError(`Error: ${e.message || 'Something went wrong. Please try again.'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const clearHistory = () => { setMessages([]); localStorage.removeItem(storageKey); };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const metrics = [
    { icon: TrendingUp, label: "Today's Revenue", value: `KES ${revenueToday.toLocaleString()}`, color: 'text-[#4F6EF6]' },
    { icon: CreditCard, label: 'Open Tabs', value: `${openTabsCount}`, color: 'text-amber-400' },
    { icon: Users, label: 'Debts', value: `${debts.length}`, color: 'text-red-400' },
    { icon: Package, label: 'Low Stock', value: `${lowStockCount}`, color: lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black themed-text tracking-tighter flex items-center gap-2.5">
            <Sparkles size={20} className="text-[#4F6EF6]" />
            Madison
          </h2>
          <p className="themed-text-dim text-xs mt-0.5">Your private business advisor · Owner only</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs themed-text-dim hover:text-red-400 transition-colors px-3 py-2 rounded-xl border themed-border hover:border-red-400/20"
          >
            <RotateCcw size={12} />
            Clear chat
          </button>
        )}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 shrink-0">
        {metrics.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="themed-bg-secondary border themed-border rounded-xl px-3 py-2.5 flex items-center gap-2.5">
            <Icon size={14} className={color} />
            <div className="min-w-0">
              <p className={`text-sm font-black ${color} truncate`}>{value}</p>
              <p className="text-[9px] themed-text-dim uppercase tracking-widest leading-none mt-0.5 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Offline / demo notice */}
      {!isOnline && (
        <div className="mb-3 flex items-center gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 shrink-0">
          <WifiOff size={14} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400/80">Madison requires an internet connection. Your POS continues working offline.</p>
        </div>
      )}

      {/* Chat messages area */}
      <div ref={chatAreaRef} className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 min-h-0">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center py-8">
            <div className="w-14 h-14 bg-[#4F6EF6]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#4F6EF6]/15">
              <Sparkles size={24} className="text-[#4F6EF6]" />
            </div>
            <p className="font-black themed-text mb-1 text-sm">Ask Madison anything about your business</p>
            <p className="text-xs themed-text-dim max-w-xs leading-relaxed">
              Ask in plain English about your sales, stock, staff, or debts. Madison reads your live business data to answer.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
              msg.role === 'user' ? 'bg-[#4F6EF6] text-white' : 'bg-white/6 border themed-border themed-text-dim'
            }`}>
              {msg.role === 'user' ? <UserIcon size={12} /> : <Bot size={12} />}
            </div>
            <div className={`max-w-[82%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#4F6EF6] text-white rounded-tr-sm'
                  : 'themed-bg-secondary border themed-border themed-text rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' ? formatMessage(msg.content) : msg.content}
              </div>
              <span className="text-[9px] themed-text-dim px-1 opacity-50">
                {new Date(msg.ts).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-white/6 border themed-border themed-text-dim mt-0.5">
              <Bot size={12} />
            </div>
            <div className="px-3.5 py-3 rounded-2xl themed-bg-secondary border themed-border rounded-tl-sm flex items-center gap-1.5">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-[#4F6EF6]" />
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.18 }} className="w-1.5 h-1.5 rounded-full bg-[#4F6EF6]" />
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.36 }} className="w-1.5 h-1.5 rounded-full bg-[#4F6EF6]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts — shown only when empty */}
      {messages.length === 0 && (
        <div className="mt-3 mb-2 shrink-0">
          <p className="text-[9px] themed-text-dim uppercase font-black tracking-widest mb-2 px-1">Quick questions</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.map(({ label, q }) => (
              <button
                key={label}
                onClick={() => send(q)}
                disabled={isLoading || !isOnline}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-white/4 border border-white/8 rounded-full themed-text-dim hover:border-[#4F6EF6]/35 hover:text-[#4F6EF6] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {label}
                <ChevronRight size={10} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-red-400 mb-2 px-1 shrink-0">{error}</motion.p>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="mt-2 shrink-0">
        <div className="flex gap-2 items-end bg-white/4 border border-white/10 rounded-2xl p-2 focus-within:border-[#4F6EF6]/40 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={handleKeyDown}
            disabled={!isOnline || isLoading}
            placeholder={isOnline ? `Ask Madison about ${businessName}…` : 'No internet connection…'}
            rows={1}
            className="flex-1 bg-transparent themed-text placeholder-white/20 focus:outline-none text-sm resize-none leading-relaxed min-h-[36px] disabled:opacity-40 py-1 px-1"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || !isOnline || isLoading}
            className="w-9 h-9 bg-[#4F6EF6] text-white rounded-xl flex items-center justify-center hover:bg-[#3D5CE4] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(79,110,246,0.3)] shrink-0 mb-0.5"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[9px] themed-text-dim text-center mt-1.5 opacity-35">
          Enter to send · Shift+Enter for new line · Conversation stored on this device only
        </p>
      </div>
    </div>
  );
};
