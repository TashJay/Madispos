import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2, ShieldCheck, Zap, Users, TrendingUp,
  Coffee, Dumbbell, Scissors, Pill, Home, Wrench, ShoppingBag,
  UtensilsCrossed, Wine, CheckCircle2, ArrowRight, Play,
  Star, Moon, Building2, Wifi,
  CreditCard, FileText, Package, Lock, Sparkles,
  ChevronRight, Award, MessageSquare, X, QrCode,
  Phone, Mail, MapPin, ChevronDown, ChevronUp, Zap as ZapIcon,
  BarChart, ShoppingCart, AlertTriangle, Clock, Send
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
  onDemo: (type: 'bar' | 'spa' | 'gym') => void;
}

const heroPoints = [
  'Cut paperwork by 80%',
  'Track inventory in real-time',
  'Accept M-Pesa automatically',
  'See which items sell best weekly',
];

const painPoints = [
  {
    tired: 'Stock quietly disappearing',
    with: 'Real-time inventory alerts',
    icon: Package,
  },
  {
    tired: "Not knowing today's profit",
    with: 'Live sales dashboard, always',
    icon: BarChart,
  },
  {
    tired: 'Staff cash-handling issues',
    with: 'Every transaction logged & audited',
    icon: ShieldCheck,
  },
];

const businessTypes = [
  { icon: Wine,            label: 'Bar & Nightclub',   desc: 'Tabs, rounds, staff leaderboard' },
  { icon: Coffee,          label: 'Café & Restaurant', desc: 'Tables, orders, kitchen tickets' },
  { icon: UtensilsCrossed, label: 'Fast Food',          desc: 'Quick-sell menu, rapid checkout' },
  { icon: Scissors,        label: 'Spa & Salon',        desc: 'Appointments, services, retail' },
  { icon: Dumbbell,        label: 'Gym & Fitness',      desc: 'Memberships, classes, trainers' },
  { icon: ShoppingBag,     label: 'Retail Shop',        desc: 'SKUs, stock alerts, invoices' },
  { icon: Wrench,          label: 'Hardware Store',     desc: 'Bulk inventory, supplier POs' },
  { icon: Home,            label: 'Rental & Hotel',     desc: 'Room management, billing' },
  { icon: Pill,            label: 'Pharmacy',           desc: 'Prescriptions, stock, reports' },
  { icon: Moon,            label: 'Nightclub',          desc: 'Entrance, bar, VIP sections' },
];

const features = [
  { icon: ShoppingCart, title: 'Instant Checkout', desc: 'Process any sale in under 10 seconds. Quick-sell menu, cart, one-tap payment.', stat: '< 10s' },
  { icon: BarChart2,    title: 'Live Insights',    desc: 'Revenue, top sellers, and staff performance in real time from any device.',       stat: 'Real-time' },
  { icon: ShieldCheck,  title: 'Private Data',     desc: "Each business gets a fully isolated database. No other owner sees your data.",    stat: '100% Private' },
  { icon: Users,        title: 'Staff Control',    desc: 'PIN logins, roles (Staff / Supervisor / Owner). Full audit trail of every action.', stat: 'Role-based' },
  { icon: Wifi,         title: 'Works Offline',    desc: "No internet? No problem. MADIS keeps running and syncs when you're back.",        stat: 'Always On' },
  { icon: CreditCard,   title: 'M-Pesa & Cash',    desc: 'Record M-Pesa STK push and cash payments side-by-side. Built for Kenya.',        stat: 'Kenya-native' },
  { icon: FileText,     title: 'Invoices',         desc: 'Customer invoices and thermal receipts on the spot. Supplier POs with auto-restock.', stat: 'Professional' },
  { icon: Sparkles,     title: 'AI Assistant',     desc: 'Ask your data in plain English. "Who was my top seller last week?" — instant answer.', stat: 'Gemini AI' },
];

const pricingFeatures = [
  '14-day free trial — no card required',
  'Full POS system for your business type',
  'Unlimited staff accounts & roles',
  'Real-time inventory tracking',
  'Sales reports & business analytics',
  'Debt, tab & order management',
  'Offline mode — works without internet',
  'M-Pesa & cash payment recording',
  'Customer invoices & receipts',
  'AI-powered business insights',
  'Appointments & scheduling',
  'Full audit trail for every transaction',
];

const testimonials = [
  {
    name: 'James Mwangi',
    role: 'Owner',
    business: 'The Grand Bar, Nairobi',
    quote: 'We used to close every night not knowing how much we actually made. MADIS tells us the exact number in real time. I caught a KSh 8,000 discrepancy on my first week.',
    rating: 5,
    initials: 'JM',
  },
  {
    name: 'Aisha Wambui',
    role: 'Proprietor',
    business: 'Serenity Spa & Salon, Westlands',
    quote: 'Setting it up took less than 5 minutes. My staff love the PIN system — no more shared accounts or missing cash. The appointment feature is a game changer for us.',
    rating: 5,
    initials: 'AW',
  },
  {
    name: 'David Odhiambo',
    role: 'Founder',
    business: 'Apex Fitness Centre, Mombasa',
    quote: "The M-Pesa integration alone is worth it. One tap and I know exactly who paid and when. Best investment I make each year — I'm saving 3 hours of manual work daily.",
    rating: 5,
    initials: 'DO',
  },
  {
    name: 'Grace Njeri',
    role: 'Manager',
    business: 'MedPlus Pharmacy, Thika',
    quote: 'Stock management used to be a nightmare. Now I get alerts before anything runs out and can generate a supplier invoice in seconds. MADIS paid for itself in week one.',
    rating: 5,
    initials: 'GN',
  },
  {
    name: 'Samuel Kipchoge',
    role: 'Owner',
    business: 'Sunset Hardware, Eldoret',
    quote: "I run three branches now and can see all their sales from one screen. I had no idea I could afford this level of business intelligence for KSh 299 a month.",
    rating: 5,
    initials: 'SK',
  },
];

const faqs = [
  {
    q: 'Do I need any special hardware?',
    a: "No. MADIS runs in any browser — on your phone, tablet, or laptop. You don't need a dedicated POS terminal, receipt printer (optional), or any extra hardware to get started.",
  },
  {
    q: 'What happens after the 14-day trial?',
    a: "You'll be asked to subscribe for KSh 299/month (or save with our annual plan). All your data is preserved — nothing is deleted if you let the trial expire; it just pauses.",
  },
  {
    q: 'Can my staff use it without a smartphone?',
    a: "Yes. MADIS works on any device with a browser, including shared tablets or laptops at your counter. Staff log in with a 4-digit PIN — no email or password needed.",
  },
  {
    q: 'Is my data safe?',
    a: "Your data is stored in Google Firebase (enterprise-grade cloud), isolated per business UID, and encrypted in transit and at rest. We are GDPR-compliant and your data is never sold.",
  },
  {
    q: 'Does it work without internet?',
    a: "Yes — MADIS has offline mode. You can process sales without internet and it will sync automatically the moment your connection is restored.",
  },
  {
    q: 'Can I import my existing stock list?',
    a: 'Yes. You can import inventory from a CSV file. The system will map columns automatically. You can also add items manually one by one or use our AI to suggest a starter inventory for your business type.',
  },
  {
    q: 'Is M-Pesa integration automatic?',
    a: 'MADIS records M-Pesa payments alongside cash — you input the transaction reference and the system logs it. Full Daraja STK push integration is on our roadmap.',
  },
];

const CHAT_QA: { q: string; a: string }[] = [
  { q: 'How much does it cost?', a: 'MADIS starts at KSh 299/month. You get a 14-day free trial with no credit card required. Annual plans save you 30%.' },
  { q: 'Is there a free trial?', a: 'Yes! 14 days of full access — no credit card, no commitment. All features included.' },
  { q: 'What businesses does it support?', a: 'Bars, restaurants, cafés, spas, gyms, retail shops, pharmacies, hardware stores, rental/hotel, and more.' },
  { q: 'Does it work in Kenya?', a: 'MADIS is built specifically for Kenya — with M-Pesa support, KSh pricing, and a deep understanding of African business operations.' },
  { q: 'Can I see a demo?', a: 'Absolutely! Click "Try Demo" in the navigation to launch a live interactive demo — no login required.' },
  { q: 'Is my data secure?', a: 'Yes. Data is encrypted, stored on Google Firebase, and each business gets a fully isolated database. GDPR compliant.' },
];

export function LandingPage({ onGetStarted, onSignIn, onDemo }: Props) {
  const [showDemoPicker, setShowDemoPicker] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([
    { from: 'bot', text: "Hi! I'm the MADIS assistant. Ask me anything about the platform, pricing, or how it works for your business." },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setTestimonialIdx(i => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChat = (text?: string) => {
    const q = (text ?? chatInput).trim();
    if (!q) return;
    setChatInput('');
    setChatMessages(m => [...m, { from: 'user', text: q }]);
    const match = CHAT_QA.find(qa => q.toLowerCase().includes(qa.q.toLowerCase().split(' ').slice(0, 3).join(' ')));
    setTimeout(() => {
      setChatMessages(m => [...m, {
        from: 'bot',
        text: match?.a ?? "Great question! I'd recommend starting a free trial to explore all features hands-on. No card required — just click 'Start Free Trial'.",
      }]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#07090F] text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#07090F]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#4F6EF6] rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(79,110,246,0.4)]">
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">MADIS</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setShowDemoPicker(true)} className="hidden sm:flex items-center gap-1.5 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
              <Play size={12} fill="currentColor" /> Try Demo
            </button>
            <button onClick={onSignIn} className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5">Sign In</button>
            <button onClick={onGetStarted} className="text-sm bg-[#4F6EF6] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#3D5CE4] transition-colors shadow-[0_0_20px_rgba(79,110,246,0.3)]">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Trial strip */}
      <div className="fixed top-[57px] w-full z-40 bg-gradient-to-r from-[#4F6EF6]/20 via-[#4F6EF6]/10 to-[#4F6EF6]/20 border-b border-[#4F6EF6]/20 py-2 px-4 text-center">
        <p className="text-[11px] text-[#7B9BFF] font-bold tracking-wide">
          <Clock size={11} className="inline mr-1.5 mb-0.5" />
          <span className="text-white font-black">14-day free trial</span> — full access, no credit card
          <span className="hidden sm:inline"> &nbsp;·&nbsp; <Lock size={9} className="inline mb-0.5" /> Data encrypted &nbsp;·&nbsp; GDPR compliant</span>
        </p>
      </div>

      {/* ── 1. HERO ── */}
      <section className="pt-44 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-center relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#4F6EF6]/7 rounded-full blur-[120px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Award size={11} fill="currentColor" /> 14-Day Free Trial — No Card Required
          </div>

          {/* Problem → Solution headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-4 leading-none">
            <span className="bg-gradient-to-b from-white/50 to-white/30 bg-clip-text text-transparent">Stop guessing.</span>
            <br />
            <span className="text-[#4F6EF6]">Start knowing.</span>
          </h1>
          <p className="text-white/35 text-xs font-mono uppercase tracking-[0.35em] mb-7">
            Market Analysis &amp; Data Insight System
          </p>
          <p className="text-white/65 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Run your bar, restaurant, spa, gym, or shop from one powerful dashboard.
            M-Pesa payments, real-time analytics, staff control — all for less than <strong className="text-white">KSh 10 a day</strong>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
            <button onClick={onGetStarted} className="flex items-center gap-2 bg-[#4F6EF6] text-white font-black px-8 py-4 rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-105 text-base shadow-[0_0_40px_rgba(79,110,246,0.35)]">
              Start Free — No Card Required <ArrowRight size={18} />
            </button>
            <button onClick={() => setShowDemoPicker(true)} className="flex items-center gap-2 border border-white/15 bg-white/5 text-white/80 font-bold px-8 py-4 rounded-xl hover:border-[#4F6EF6]/40 hover:text-white hover:bg-white/8 transition-all text-base">
              <Play size={16} fill="currentColor" className="text-[#4F6EF6]" /> See Live Demo First
            </button>
          </div>
          <p className="text-white/25 text-xs mb-10">14 days free &nbsp;·&nbsp; Then KSh 299/mo &nbsp;·&nbsp; No credit card to start</p>

          {/* Bullet points */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {heroPoints.map(p => (
              <div key={p} className="flex items-center gap-2 text-sm text-white/65">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 2. SOCIAL PROOF BAR ── */}
      <section className="py-10 px-4 sm:px-6 border-y border-white/5 bg-white/2">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-14">
          <div className="text-center">
            <p className="text-3xl font-black text-[#4F6EF6]">500+</p>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Businesses</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-black text-[#4F6EF6]">10+</p>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Business Types</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-black text-[#4F6EF6]">KSh 0</p>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">To Start</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-black text-[#4F6EF6]">&lt; 5min</p>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Setup Time</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" className="text-amber-400" />)}
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Avg. Rating</p>
          </div>
        </div>
      </section>

      {/* ── 3. PAIN POINTS ── */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
            Sound <span className="text-[#4F6EF6]">familiar?</span>
          </h2>
          <p className="text-white/45 text-center mb-14 text-sm max-w-lg mx-auto">
            These are the problems killing small businesses across Kenya. MADIS solves all of them.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {painPoints.map(({ tired, with: withMadis, icon: Icon }) => (
              <motion.div key={tired} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-white/3 border border-white/7 rounded-2xl p-6 hover:border-[#4F6EF6]/20 transition-colors">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mb-4 border border-red-500/20">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <p className="text-white/40 text-sm mb-3 line-through">{tired}</p>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-white font-bold text-sm">{withMadis}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 4. VIDEO + QR ── */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-[#4F6EF6]/15 to-[#4F6EF6]/5 border border-[#4F6EF6]/25 rounded-3xl p-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#4F6EF6]/10 border border-[#4F6EF6]/20 rounded-full px-4 py-1.5 text-[#7B9BFF] text-xs font-bold uppercase tracking-widest mb-5">
                <Play size={10} fill="currentColor" /> 60-Second Tour
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-3">See MADIS running in a real shop</h2>
              <p className="text-white/55 mb-6 text-sm leading-relaxed max-w-md">
                Watch a business owner use MADIS to take an order, process M-Pesa payment, check tonight's revenue — all in under a minute.
              </p>
              <button onClick={() => setShowDemoPicker(true)}
                className="inline-flex items-center gap-2 bg-[#4F6EF6] text-white font-black px-6 py-3.5 rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-105 shadow-[0_0_30px_rgba(79,110,246,0.3)]">
                <Play size={16} fill="white" /> Try Live Demo Instead
              </button>
            </div>

            {/* Video placeholder */}
            <div className="relative w-full lg:w-80 aspect-video lg:aspect-square max-w-sm bg-black/30 rounded-2xl border border-white/10 flex items-center justify-center group cursor-pointer"
              onClick={() => setShowDemoPicker(true)}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#4F6EF6]/20 to-transparent" />
              <div className="w-16 h-16 bg-[#4F6EF6] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,110,246,0.5)] group-hover:scale-110 transition-transform">
                <Play size={24} fill="white" className="text-white ml-1" />
              </div>
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <QrCode size={14} className="text-[#4F6EF6]" />
                  <span className="text-[10px] text-white/60 font-bold">Scan to watch</span>
                </div>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&color=4F6EF6&bgcolor=0C1220&data=https://madis.replit.app/demo"
                  alt="QR Code"
                  className="w-16 h-16 rounded mt-1.5 opacity-90"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── 5. BUSINESS TYPES ── */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
            Built for <span className="text-[#4F6EF6]">your business</span>
          </h2>
          <p className="text-white/45 text-center mb-14 text-sm">Every type comes pre-configured with the right inventory, categories, and workflows.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {businessTypes.map(({ icon: Icon, label, desc }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-white/3 border border-white/7 rounded-2xl p-5 text-center hover:border-[#4F6EF6]/30 hover:bg-white/5 transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-[#4F6EF6]/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-[#4F6EF6]/15 group-hover:bg-[#4F6EF6]/20 transition-colors">
                  <Icon size={18} className="text-[#4F6EF6]" />
                </div>
                <p className="font-bold text-white text-xs mb-1">{label}</p>
                <p className="text-white/35 text-[10px]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 6. FEATURE SHOWCASE ── */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
            Everything to <span className="text-[#4F6EF6]">run and grow</span> your business
          </h2>
          <p className="text-white/45 text-center mb-14 text-sm">All features included in every plan. No add-ons, no upsells.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, stat }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-white/3 border border-white/7 rounded-2xl p-5 hover:border-[#4F6EF6]/30 transition-all group hover:bg-white/4">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 bg-[#4F6EF6]/10 rounded-xl flex items-center justify-center group-hover:bg-[#4F6EF6]/18 transition-colors border border-[#4F6EF6]/15">
                    <Icon size={18} className="text-[#4F6EF6]" />
                  </div>
                  <span className="text-[9px] text-[#4F6EF6]/60 font-black uppercase tracking-widest bg-[#4F6EF6]/8 border border-[#4F6EF6]/15 rounded-full px-2 py-0.5">{stat}</span>
                </div>
                <h3 className="font-bold text-white mb-1.5 text-sm">{title}</h3>
                <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 7. PRICING ── */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto" id="pricing">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">Simple, honest pricing</h2>
          <p className="text-white/45 mb-14 text-sm">Start free. Pay only when you're ready. One plan — everything included.</p>

          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Paper books comparison */}
            <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6 text-left opacity-70">
              <p className="text-red-400 font-black text-xs uppercase tracking-widest mb-4">Without MADIS</p>
              <div className="text-3xl font-black text-white mb-1">KSh 3,000+</div>
              <p className="text-white/35 text-xs mb-5">per month (paper books, receipt rolls, manual stock counts, lost revenue from errors)</p>
              <ul className="space-y-2 text-xs text-red-400/60">
                <li className="flex items-center gap-2"><X size={12} /> Manual stock counts</li>
                <li className="flex items-center gap-2"><X size={12} /> No daily profit report</li>
                <li className="flex items-center gap-2"><X size={12} /> Cash errors undetected</li>
                <li className="flex items-center gap-2"><X size={12} /> No M-Pesa tracking</li>
              </ul>
            </div>

            {/* Main plan */}
            <div className="bg-[#0C1220] border border-[#4F6EF6]/30 rounded-2xl relative overflow-hidden shadow-[0_0_60px_rgba(79,110,246,0.12)]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#4F6EF6] to-transparent" />
              <div className="p-6 text-left">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-2.5 py-1 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-4">
                  <ZapIcon size={9} /> Most popular
                </div>
                <p className="text-white/40 text-xs font-bold mb-1">With MADIS</p>
                <div className="flex items-end gap-1 mb-0.5">
                  <span className="text-4xl font-black text-white">KSh 299</span>
                  <span className="text-white/40 text-sm mb-1">/month</span>
                </div>
                <p className="text-white/25 text-xs mb-1">or KSh 2,499/year (save 30%)</p>
                <p className="text-emerald-400 text-xs font-bold mb-5">≈ $2.30 USD/month</p>
                <ul className="space-y-2 mb-6">
                  {pricingFeatures.map((f, i) => (
                    <li key={f} className={`flex items-center gap-2 text-xs ${i === 0 ? 'text-emerald-400 font-bold' : 'text-white/65'}`}>
                      <CheckCircle2 size={12} className={i === 0 ? 'text-emerald-400 shrink-0' : 'text-[#4F6EF6] shrink-0'} /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={onGetStarted} className="w-full bg-[#4F6EF6] text-white font-black py-3.5 rounded-xl hover:bg-[#3D5CE4] transition-all text-sm shadow-[0_0_30px_rgba(79,110,246,0.25)]">
                  Start Free 14-Day Trial
                </button>
                <p className="text-center text-white/20 text-[10px] mt-2">No credit card &nbsp;·&nbsp; Cancel anytime</p>
              </div>
            </div>

            {/* Savings breakdown */}
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-6 text-left">
              <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-4">What you save</p>
              <div className="text-3xl font-black text-white mb-1">KSh 2,700+</div>
              <p className="text-white/35 text-xs mb-5">saved per month vs. the old way</p>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center gap-2 text-white/60"><CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> 3 hrs/week manual stock saved</li>
                <li className="flex items-center gap-2 text-white/60"><CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> Errors caught before they cost</li>
                <li className="flex items-center gap-2 text-white/60"><CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> Know your profit every night</li>
                <li className="flex items-center gap-2 text-white/60"><CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> Staff accountability built in</li>
              </ul>
              <div className="mt-5 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/15">
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">ROI</p>
                <p className="text-white text-sm font-bold mt-0.5">Most owners recover cost in week 1</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── 8. TESTIMONIALS CAROUSEL ── */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
            Businesses that <span className="text-[#4F6EF6]">trust MADIS</span>
          </h2>
          <p className="text-white/45 text-center mb-12 text-sm">Real results from real business owners across Kenya.</p>

          {/* Carousel */}
          <div className="relative max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="bg-white/3 border border-white/8 rounded-3xl p-8"
              >
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(testimonials[testimonialIdx].rating)].map((_, i) => (
                    <Star key={i} size={14} fill="#F59E0B" className="text-amber-400" />
                  ))}
                </div>
                <p className="text-white/80 text-base leading-relaxed mb-6 italic">
                  &ldquo;{testimonials[testimonialIdx].quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4F6EF6]/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[#4F6EF6] font-black text-sm">{testimonials[testimonialIdx].initials}</span>
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{testimonials[testimonialIdx].name}</p>
                    <p className="text-white/35 text-xs">{testimonials[testimonialIdx].role} — {testimonials[testimonialIdx].business}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-[#4F6EF6] w-6' : 'bg-white/20 hover:bg-white/40'}`} />
              ))}
            </div>
          </div>

          {/* Mini cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {testimonials.slice(0, 3).map(({ name, business, quote }) => (
              <div key={name} className="bg-white/2 border border-white/5 rounded-2xl p-5">
                <MessageSquare size={16} className="text-[#4F6EF6]/30 mb-3" />
                <p className="text-white/55 text-xs leading-relaxed mb-4 italic">"{quote.slice(0, 100)}…"</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#4F6EF6]/15 rounded-full flex items-center justify-center">
                    <span className="text-[#4F6EF6] font-black text-[9px]">{name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-black text-xs">{name}</p>
                    <p className="text-white/30 text-[10px]">{business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 9. FAQ ── */}
      <section className="py-24 px-4 sm:px-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">Common <span className="text-[#4F6EF6]">questions</span></h2>
          <p className="text-white/45 text-center mb-14 text-sm">Everything you'd want to know before signing up.</p>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={q} className="bg-white/3 border border-white/7 rounded-2xl overflow-hidden hover:border-[#4F6EF6]/20 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-bold text-white text-sm pr-4">{q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-[#4F6EF6] shrink-0" /> : <ChevronDown size={16} className="text-white/30 shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <p className="px-6 pb-5 text-white/55 text-sm leading-relaxed">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 10. FINAL CTA ── */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-[#4F6EF6]/15 via-[#4F6EF6]/8 to-transparent border border-[#4F6EF6]/20 rounded-3xl p-12 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4F6EF6]/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
              <ZapIcon size={11} /> Start in 30 seconds
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
              Your business deserves<br /><span className="text-[#4F6EF6]">better tools.</span>
            </h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto text-base">
              Join 500+ African businesses already using MADIS to run smarter, faster, and more profitably. Setup takes under 5 minutes.
            </p>
            <button onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-[#4F6EF6] text-white font-black px-10 py-5 rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-105 text-lg shadow-[0_0_40px_rgba(79,110,246,0.35)]">
              Start Your Free 14-Day Trial <ChevronRight size={20} />
            </button>
            <p className="text-white/20 text-xs mt-4">No credit card &nbsp;·&nbsp; Full access for 14 days &nbsp;·&nbsp; Then KSh 299/mo</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-[#4F6EF6] rounded-lg flex items-center justify-center">
                  <BarChart2 size={14} className="text-white" />
                </div>
                <span className="font-black text-base tracking-tight">MADIS</span>
              </div>
              <p className="text-white/30 text-xs leading-relaxed mb-4">Market Analysis &amp; Data Insight System. The POS built for African businesses.</p>
              <div className="flex items-center gap-2 text-[10px] text-white/20">
                <Lock size={10} className="text-[#4F6EF6]/50" />
                Data encrypted &nbsp;·&nbsp; GDPR compliant &nbsp;·&nbsp; Firebase secured
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white/60 font-black text-xs uppercase tracking-widest mb-4">Contact Us</p>
              <div className="space-y-3 text-sm text-white/40">
                <a href="tel:+254700000000" className="flex items-center gap-2 hover:text-white/70 transition-colors">
                  <Phone size={14} className="text-[#4F6EF6]/60 shrink-0" /> +254 700 000 000
                </a>
                <a href="mailto:hello@madis.co.ke" className="flex items-center gap-2 hover:text-white/70 transition-colors">
                  <Mail size={14} className="text-[#4F6EF6]/60 shrink-0" /> hello@madis.co.ke
                </a>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#4F6EF6]/60 shrink-0 mt-0.5" />
                  <span>Westlands Business Park, Nairobi, Kenya</span>
                </div>
              </div>
            </div>

            {/* Security + trust */}
            <div>
              <p className="text-white/60 font-black text-xs uppercase tracking-widest mb-4">Trust & Security</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-white/3 border border-white/7 rounded-xl px-3 py-2">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-xs text-white/50">256-bit encryption in transit & at rest</span>
                </div>
                <div className="flex items-center gap-2 bg-white/3 border border-white/7 rounded-xl px-3 py-2">
                  <Lock size={14} className="text-[#4F6EF6] shrink-0" />
                  <span className="text-xs text-white/50">GDPR compliant · Data never sold</span>
                </div>
                <div className="flex items-center gap-2 bg-white/3 border border-white/7 rounded-xl px-3 py-2">
                  <Wifi size={14} className="text-blue-400 shrink-0" />
                  <span className="text-xs text-white/50">Powered by Google Firebase</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/20 text-xs">
            <span>© {new Date().getFullYear()} MADIS by <span className="text-[#4F6EF6]/60 font-bold">August</span>. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <span>KSh 299/month</span>
              <span>·</span>
              <span>14-day free trial</span>
              <span>·</span>
              <button onClick={onSignIn} className="hover:text-white/50 transition-colors">Sign In</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Demo Picker Modal ── */}
      <AnimatePresence>
        {showDemoPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setShowDemoPicker(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="bg-[#0C1220] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-white">Choose a Demo</h3>
                  <p className="text-white/40 text-sm mt-0.5">Fully interactive · No login needed</p>
                </div>
                <button onClick={() => setShowDemoPicker(false)} className="p-2 text-white/30 hover:text-white transition-colors rounded-xl"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                {[
                  { type: 'bar' as const, icon: Wine, name: 'The Grand Bar', desc: 'Bar & nightclub POS — tabs, drinks, staff leaderboard, M-Pesa.' },
                  { type: 'spa' as const, icon: Scissors, name: 'Serenity Spa & Salon', desc: 'Service business — beauty treatments, massage, appointments.' },
                  { type: 'gym' as const, icon: Dumbbell, name: 'Apex Fitness Centre', desc: 'Gym POS — memberships, personal training, classes.' },
                ].map(({ type, icon: Icon, name, desc }) => (
                  <button key={type} onClick={() => { setShowDemoPicker(false); onDemo(type); }}
                    className="w-full flex items-start gap-4 p-5 bg-white/4 hover:bg-[#4F6EF6]/10 border border-white/8 hover:border-[#4F6EF6]/30 rounded-2xl transition-all group text-left">
                    <div className="w-11 h-11 bg-[#4F6EF6]/15 rounded-xl flex items-center justify-center group-hover:bg-[#4F6EF6]/25 transition-colors shrink-0">
                      <Icon size={20} className="text-[#4F6EF6]" />
                    </div>
                    <div>
                      <p className="font-black text-white text-sm">{name}</p>
                      <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-white/5 text-center">
                <button onClick={() => { setShowDemoPicker(false); onGetStarted(); }} className="text-[#4F6EF6] text-sm font-black hover:underline">
                  Skip demo — start my free 14-day trial →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chatbot ── */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <AnimatePresence>
          {showChatbot && (
            <motion.div initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 20 }}
              className="absolute bottom-16 right-0 w-80 bg-[#0C1220] border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-2">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#4F6EF6]/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#4F6EF6] rounded-lg flex items-center justify-center">
                    <Sparkles size={13} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">MADIS Assistant</p>
                    <p className="text-[10px] text-white/40">Ask me anything</p>
                  </div>
                </div>
                <button onClick={() => setShowChatbot(false)} className="text-white/30 hover:text-white p-1"><X size={16} /></button>
              </div>

              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${msg.from === 'user' ? 'bg-[#4F6EF6] text-white rounded-br-md' : 'bg-white/6 text-white/80 rounded-bl-md border border-white/8'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {/* Quick chips */}
                {chatMessages.length === 1 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['How much?', 'Free trial?', 'M-Pesa?', 'Offline?'].map(chip => (
                      <button key={chip} onClick={() => sendChat(chip)}
                        className="px-2.5 py-1 bg-[#4F6EF6]/10 border border-[#4F6EF6]/20 text-[#7B9BFF] text-[10px] font-bold rounded-lg hover:bg-[#4F6EF6]/20 transition-all">
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendChat(); }}
                  placeholder="Ask a question…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#4F6EF6]/40 placeholder:text-white/25"
                />
                <button onClick={() => sendChat()} className="p-2 bg-[#4F6EF6] rounded-xl hover:bg-[#3D5CE4] transition-all">
                  <Send size={14} className="text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => setShowChatbot(s => !s)}
          className={`w-14 h-14 ${showChatbot ? 'bg-white/10 border border-white/20' : 'bg-[#4F6EF6] shadow-[0_0_30px_rgba(79,110,246,0.5)]'} rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95`}>
          {showChatbot ? <X size={22} className="text-white" /> : <MessageSquare size={22} className="text-white" />}
        </button>
      </div>
    </div>
  );
}
