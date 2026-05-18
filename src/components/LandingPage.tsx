import { motion } from 'motion/react';
import {
  BarChart2, ShieldCheck, Zap, Users, TrendingUp, Globe,
  Coffee, Dumbbell, Scissors, Pill, Home, Wrench, ShoppingBag,
  UtensilsCrossed, Wine, Star, CheckCircle2, ArrowRight
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const features = [
  { icon: BarChart2, title: 'Real-Time Analytics', desc: 'Track sales, revenue and stock levels as they happen — no delays, no guesswork.' },
  { icon: ShieldCheck, title: 'Secure & Private', desc: 'Each business gets its own isolated data environment. Your data is yours alone.' },
  { icon: Users, title: 'Staff Management', desc: 'Add staff with role-based access. Supervisors, cashiers, and owners — all controlled.' },
  { icon: TrendingUp, title: 'Business Intelligence', desc: 'Hourly trends, top sellers, staff performance — insight that drives decisions.' },
  { icon: Globe, title: 'Works Everywhere', desc: 'Runs on any device — phone, tablet, or desktop. Works even when you go offline.' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Instant checkout flow designed to keep queues short and customers happy.' },
];

const businessTypes = [
  { icon: Wine, label: 'Bar & Nightclub' },
  { icon: Coffee, label: 'Café & Restaurant' },
  { icon: UtensilsCrossed, label: 'Fast Food' },
  { icon: Scissors, label: 'Spa & Salon' },
  { icon: Dumbbell, label: 'Gym & Fitness' },
  { icon: ShoppingBag, label: 'Retail Shop' },
  { icon: Wrench, label: 'Hardware Store' },
  { icon: Home, label: 'Rental & Hotel' },
  { icon: Pill, label: 'Pharmacy' },
];

const pricingFeatures = [
  'Full POS system',
  'Unlimited staff accounts',
  'Real-time inventory tracking',
  'Sales reports & analytics',
  'Debt & tab management',
  'Offline mode',
  'M-Pesa & cash payments',
  'Audit trail & logs',
];

export function LandingPage({ onGetStarted, onSignIn }: Props) {
  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#080808]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00FF88] rounded-lg flex items-center justify-center">
              <BarChart2 size={16} className="text-black" />
            </div>
            <span className="font-black text-lg tracking-tight">MADIS</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="text-sm bg-[#00FF88] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#00e87a] transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-full px-4 py-1.5 text-[#00FF88] text-xs font-bold uppercase tracking-widest mb-6">
            <Star size={12} />
            The Smart POS Platform
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-4 leading-none">
            MADIS
          </h1>
          <p className="text-white/40 text-xs font-mono uppercase tracking-[0.3em] mb-6">
            Market Analysis & Data Insight System
          </p>
          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            One platform. Every business. Manage sales, staff, stock and insights — all from a single dashboard built for the way you work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-[#00FF88] text-black font-black px-8 py-4 rounded-xl hover:bg-[#00e87a] transition-all hover:scale-105 text-base shadow-[0_0_40px_rgba(0,255,136,0.3)]"
            >
              Start Free — KSh 1,000/yr
              <ArrowRight size={18} />
            </button>
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 border border-white/10 text-white/70 font-bold px-8 py-4 rounded-xl hover:border-white/30 hover:text-white transition-all text-base"
            >
              Sign In to Dashboard
            </button>
          </div>
          <p className="text-white/30 text-xs mt-4">
            That's less than KSh 3 per day — or $1 USD per year.
          </p>
        </motion.div>
      </section>

      {/* Business types */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <p className="text-center text-white/40 text-xs font-bold uppercase tracking-widest mb-8">
            Built for every type of business
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {businessTypes.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-2 text-sm text-white/70">
                <Icon size={14} className="text-[#00FF88]" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
            Everything you need to <span className="text-[#00FF88]">run your business</span>
          </h2>
          <p className="text-white/50 text-center mb-16 max-w-lg mx-auto">
            No complex setup. No expensive hardware. Just open your browser and start selling.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-[#00FF88]/30 transition-colors group"
              >
                <div className="w-10 h-10 bg-[#00FF88]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#00FF88]/20 transition-colors">
                  <Icon size={20} className="text-[#00FF88]" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Simple, honest pricing</h2>
          <p className="text-white/50 mb-12">One plan. Everything included. No hidden fees.</p>
          <div className="max-w-md mx-auto bg-[#0d0d0d] border border-[#00FF88]/30 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,255,136,0.08)]">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-5xl font-black text-[#00FF88]">KSh 1,000</span>
            </div>
            <p className="text-white/40 text-sm mb-1">per year &nbsp;·&nbsp; ≈ $1 USD</p>
            <p className="text-white/25 text-xs mb-8">Billed annually. Cancel any time.</p>
            <ul className="space-y-3 text-left mb-8">
              {pricingFeatures.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 size={16} className="text-[#00FF88] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={onGetStarted}
              className="w-full bg-[#00FF88] text-black font-black py-4 rounded-xl hover:bg-[#00e87a] transition-all hover:scale-[1.02] text-base shadow-[0_0_30px_rgba(0,255,136,0.2)]"
            >
              Get Started Now
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#00FF88] rounded-md flex items-center justify-center">
              <BarChart2 size={12} className="text-black" />
            </div>
            <span className="font-black text-sm tracking-tight">MADIS</span>
            <span className="text-white/30 text-xs">Market Analysis & Data Insight System</span>
          </div>
          <p className="text-white/25 text-xs">
            Built by <span className="text-white/50 font-bold">August</span> &nbsp;·&nbsp; © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
