import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2, ShieldCheck, Zap, Users, TrendingUp, Globe,
  Coffee, Dumbbell, Scissors, Pill, Home, Wrench, ShoppingBag,
  UtensilsCrossed, Wine, CheckCircle2, ArrowRight, Play,
  Star, Moon, Building2, Smartphone, X, Clock, Wifi,
  CreditCard, FileText, Package, BarChart, Lock, Sparkles,
  ChevronRight, Award, MessageSquare
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
  onDemo: (type: 'bar' | 'spa' | 'gym') => void;
}

const features = [
  {
    icon: ShoppingCart2,
    title: 'Instant Checkout',
    desc: 'Process any sale in under 10 seconds. Quick-sell menu, cart management, and one-tap payment — no training needed.',
    stat: '< 10s'
  },
  {
    icon: BarChart2,
    title: 'Live Business Insights',
    desc: 'See your revenue, top sellers, and staff performance in real time — right from your phone or tablet.',
    stat: 'Real-time'
  },
  {
    icon: ShieldCheck,
    title: 'Your Data, Only Yours',
    desc: 'Each business gets a fully isolated private database. No other business can ever see your data.',
    stat: '100% Private'
  },
  {
    icon: Users,
    title: 'Full Staff Control',
    desc: 'Give each staff member a PIN. Set roles: Staff, Supervisor, Owner. Full audit trail of every action.',
    stat: 'Role-based'
  },
  {
    icon: Wifi,
    title: 'Works Offline Too',
    desc: 'No internet? No problem. MADIS keeps running and syncs automatically when you\'re back online.',
    stat: 'Always On'
  },
  {
    icon: CreditCard,
    title: 'M-Pesa & Cash',
    desc: 'Record M-Pesa STK push and cash payments side-by-side. Built from the ground up for African markets.',
    stat: 'Kenya-native'
  },
  {
    icon: FileText,
    title: 'Invoices & Receipts',
    desc: 'Generate customer invoices and thermal receipts on the spot. Track supplier purchases with auto-restock.',
    stat: 'Professional'
  },
  {
    icon: Sparkles,
    title: 'AI Business Assistant',
    desc: 'Ask your data questions in plain English. "Who was my top seller last week?" — get the answer instantly.',
    stat: 'Gemini AI'
  },
];

function ShoppingCart2({ size, className }: { size: number; className?: string }) {
  return <ShoppingBag size={size} className={className} />;
}

const businessTypes = [
  { icon: Wine,           label: 'Bar & Nightclub' },
  { icon: Coffee,         label: 'Café & Restaurant' },
  { icon: UtensilsCrossed,label: 'Fast Food' },
  { icon: Scissors,       label: 'Spa & Salon' },
  { icon: Dumbbell,       label: 'Gym & Fitness' },
  { icon: ShoppingBag,    label: 'Retail Shop' },
  { icon: Wrench,         label: 'Hardware Store' },
  { icon: Home,           label: 'Rental & Hotel' },
  { icon: Pill,           label: 'Pharmacy' },
  { icon: Moon,           label: 'Nightclub' },
  { icon: Building2,      label: 'Hotel' },
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
  'Full audit trail for every transaction',
];

const steps = [
  { step: '01', title: 'Sign Up Free',      desc: 'Create your account with email or Google in 30 seconds. No card required.' },
  { step: '02', title: 'Choose Business',   desc: 'Select your business type — bar, spa, restaurant, shop, and more.' },
  { step: '03', title: '14 Days Free',      desc: 'Use every feature completely free for 14 days. No limits, no commitments.' },
  { step: '04', title: 'Subscribe & Keep',  desc: 'KSh 1,000/year keeps everything running. Your data is always preserved.' },
];

const stats = [
  { value: '10+',     label: 'Business Types' },
  { value: 'KSh 3',  label: 'Per Day Only' },
  { value: '14',     label: 'Day Free Trial' },
  { value: '100%',   label: 'Data Privacy' },
];

const testimonials = [
  {
    name: 'James M.',
    business: 'The Grand Bar, Nairobi',
    quote: 'We used to close every night not knowing how much we actually made. MADIS tells us the exact number in real time.',
  },
  {
    name: 'Aisha W.',
    business: 'Serenity Spa & Salon',
    quote: 'Setting it up took less than 5 minutes. My staff love the PIN system — no more shared accounts or missing cash.',
  },
  {
    name: 'David O.',
    business: 'Apex Fitness, Mombasa',
    quote: 'The M-Pesa integration alone is worth it. One tap and I know exactly who paid and when. Best KSh 1,000 I spend each year.',
  },
];

export function LandingPage({ onGetStarted, onSignIn, onDemo }: Props) {
  const [showDemoPicker, setShowDemoPicker] = useState(false);

  const openDemoPicker = () => setShowDemoPicker(true);

  return (
    <div className="min-h-screen bg-[#07090F] text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#07090F]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#4F6EF6] rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(79,110,246,0.4)]">
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">MADIS</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openDemoPicker}
              className="hidden sm:flex items-center gap-1.5 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              <Play size={12} fill="currentColor" />
              Try Demo
            </button>
            <button
              onClick={onSignIn}
              className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="text-sm bg-[#4F6EF6] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#3D5CE4] transition-colors shadow-[0_0_20px_rgba(79,110,246,0.3)]"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Free Trial Badge Strip */}
      <div className="fixed top-[57px] w-full z-40 bg-gradient-to-r from-[#4F6EF6]/20 via-[#4F6EF6]/10 to-[#4F6EF6]/20 border-b border-[#4F6EF6]/20 py-2 px-4 text-center">
        <p className="text-[11px] text-[#7B9BFF] font-bold tracking-wide">
          <Clock size={11} className="inline mr-1.5 mb-0.5" />
          <span className="text-white font-black">14-day free trial</span> — full access, no credit card, no commitment
          <span className="hidden sm:inline"> &nbsp;·&nbsp; Cancel anytime</span>
        </p>
      </div>

      {/* Hero */}
      <section className="pt-44 pb-28 px-4 sm:px-6 max-w-6xl mx-auto text-center relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#4F6EF6]/7 rounded-full blur-[120px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Award size={11} fill="currentColor" />
            14-Day Free Trial — No Card Required
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-4 leading-none">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              The POS Built
            </span>
            <br />
            <span className="text-[#4F6EF6]">for Africa</span>
          </h1>
          <p className="text-white/35 text-xs font-mono uppercase tracking-[0.35em] mb-7">
            Market Analysis &amp; Data Insight System
          </p>
          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Run your bar, restaurant, spa, gym, or shop from one powerful dashboard.
            M-Pesa payments, real-time analytics, staff management — all for less than <strong className="text-white">KSh 3 a day</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-[#4F6EF6] text-white font-black px-8 py-4 rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-105 text-base shadow-[0_0_40px_rgba(79,110,246,0.35)]"
            >
              Start Your Free 14-Day Trial
              <ArrowRight size={18} />
            </button>
            <button
              onClick={openDemoPicker}
              className="flex items-center gap-2 border border-white/15 bg-white/5 text-white/80 font-bold px-8 py-4 rounded-xl hover:border-[#4F6EF6]/40 hover:text-white hover:bg-white/8 transition-all text-base"
            >
              <Play size={16} fill="currentColor" className="text-[#4F6EF6]" />
              See Live Demo First
            </button>
          </div>
          <p className="text-white/25 text-xs">
            14 days free &nbsp;·&nbsp; Then KSh 1,000/yr &nbsp;·&nbsp; No credit card to start
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center bg-white/3 border border-white/7 rounded-2xl p-6">
              <p className="text-3xl font-black text-[#4F6EF6] mb-1">{value}</p>
              <p className="text-white/45 text-xs font-bold uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Business types marquee */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="text-center text-white/35 text-xs font-bold uppercase tracking-widest mb-7">
            Built for every type of business
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {businessTypes.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/4 border border-white/7 rounded-full px-4 py-2 text-sm text-white/65 hover:border-[#4F6EF6]/30 hover:text-white/80 transition-colors">
                <Icon size={13} className="text-[#4F6EF6]" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
            Up and running in <span className="text-[#4F6EF6]">minutes</span>
          </h2>
          <p className="text-white/45 text-center mb-14 max-w-lg mx-auto text-sm">
            No technical setup. No expensive hardware. Just open your browser and start.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white/3 border border-white/7 rounded-2xl p-6 group hover:border-[#4F6EF6]/30 transition-colors"
              >
                <span className="text-[#4F6EF6]/20 text-5xl font-black absolute top-4 right-5 leading-none select-none">{step}</span>
                <div className="w-10 h-10 bg-[#4F6EF6]/10 rounded-xl flex items-center justify-center mb-5 border border-[#4F6EF6]/15">
                  <span className="text-[#4F6EF6] font-black text-sm">{step}</span>
                </div>
                <h3 className="font-bold text-white mb-2 text-base">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                {step === '03' && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 size={9} />
                    Free
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
            Everything to <span className="text-[#4F6EF6]">run and grow</span> your business
          </h2>
          <p className="text-white/45 text-center mb-14 max-w-lg mx-auto text-sm">
            All features are included in the trial and every plan. No add-ons, no upsells.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, stat }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/3 border border-white/7 rounded-2xl p-5 hover:border-[#4F6EF6]/30 transition-all group hover:bg-white/4"
              >
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

      {/* Trial CTA Banner */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-[#4F6EF6]/10 border border-emerald-500/20 rounded-3xl p-10 text-center"
        >
          <div className="absolute inset-0 bg-[#4F6EF6]/3 rounded-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
              <Clock size={12} />
              14-Day Free Trial
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3">Try every feature free for 14 days</h2>
            <p className="text-white/55 max-w-md mx-auto mb-7 text-sm leading-relaxed">
              No credit card. No commitment. Just sign up, pick your business type, and you get full access to everything — M-Pesa, invoices, AI insights, staff management, reports — all free for 14 days.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-[#4F6EF6] text-white font-black px-8 py-4 rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-105 shadow-[0_0_30px_rgba(79,110,246,0.3)]"
              >
                Start Free Trial — No Card Needed
                <ArrowRight size={16} />
              </button>
              <button
                onClick={openDemoPicker}
                className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm font-bold py-4"
              >
                <Play size={12} fill="currentColor" />
                Watch demo first
              </button>
            </div>
            <p className="text-white/25 text-xs">After trial: KSh 1,000/year &nbsp;·&nbsp; Your data is always kept safe</p>
          </div>
        </motion.div>
      </section>

      {/* Demo CTA Banner */}
      <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-[#4F6EF6]/15 to-[#4F6EF6]/5 border border-[#4F6EF6]/25 rounded-3xl p-10 text-center"
        >
          <div className="absolute inset-0 bg-[#4F6EF6]/5 rounded-3xl" />
          <div className="relative">
            <div className="w-14 h-14 bg-[#4F6EF6] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(79,110,246,0.4)]">
              <Play size={24} className="text-white" fill="white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3">See MADIS live — no sign-up needed</h2>
            <p className="text-white/55 max-w-md mx-auto mb-7 text-sm leading-relaxed">
              Try a fully interactive demo with realistic data. Browse inventory, process sales, check reports — the real system running right now.
            </p>
            <button
              onClick={openDemoPicker}
              className="inline-flex items-center gap-2 bg-[#4F6EF6] text-white font-black px-8 py-4 rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-105 shadow-[0_0_30px_rgba(79,110,246,0.3)]"
            >
              <Play size={16} fill="white" />
              Choose Your Demo
            </button>
            <p className="text-white/25 text-xs mt-4">No account required &nbsp;·&nbsp; Dummy data &nbsp;·&nbsp; Fully interactive</p>
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
            Businesses that <span className="text-[#4F6EF6]">trust MADIS</span>
          </h2>
          <p className="text-white/45 text-center mb-14 text-sm">Real results from real business owners across Kenya.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, business, quote }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/3 border border-white/7 rounded-2xl p-6 hover:border-[#4F6EF6]/25 transition-colors"
              >
                <MessageSquare size={20} className="text-[#4F6EF6]/40 mb-4" />
                <p className="text-white/70 text-sm leading-relaxed mb-5 italic">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#4F6EF6]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#4F6EF6] font-black text-xs">{name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{name}</p>
                    <p className="text-white/35 text-xs">{business}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">Simple, honest pricing</h2>
          <p className="text-white/45 mb-14 text-sm">Start free. Pay only when you're ready. One plan — everything included.</p>

          <div className="max-w-sm mx-auto">
            {/* Free trial card */}
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-t-3xl p-5 text-center">
              <p className="text-emerald-400 font-black text-sm uppercase tracking-widest mb-1">Start Here — It's Free</p>
              <p className="text-emerald-400/60 text-xs">14 days of full access, no card required</p>
            </div>

            <div className="bg-[#0C1220] border-x border-b border-[#4F6EF6]/25 rounded-b-3xl p-8 shadow-[0_0_60px_rgba(79,110,246,0.08)] relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#4F6EF6]/8 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative">
                <div className="flex items-end justify-center gap-1 mb-1 mt-2">
                  <span className="text-white/40 text-lg font-black mb-1">Then just</span>
                  <span className="text-5xl font-black text-white">KSh 1,000</span>
                </div>
                <p className="text-white/35 text-sm mb-1">per year &nbsp;·&nbsp; ≈ $1 USD</p>
                <p className="text-white/20 text-xs mb-8">Billed annually. Cancel any time. Data always kept.</p>
                <ul className="space-y-3 text-left mb-8">
                  {pricingFeatures.map((f, i) => (
                    <li key={f} className={`flex items-center gap-3 text-sm ${i === 0 ? 'text-emerald-400 font-bold' : 'text-white/65'}`}>
                      <CheckCircle2 size={15} className={i === 0 ? 'text-emerald-400 shrink-0' : 'text-[#4F6EF6] shrink-0'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className="w-full bg-[#4F6EF6] text-white font-black py-4 rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-[1.02] text-base shadow-[0_0_30px_rgba(79,110,246,0.25)]"
                >
                  Start Free 14-Day Trial
                </button>
                <p className="text-center text-white/20 text-xs mt-3">No credit card &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; Data always yours</p>
                <button
                  onClick={openDemoPicker}
                  className="w-full mt-2 text-white/40 hover:text-white/70 text-sm transition-colors py-2 flex items-center justify-center gap-1.5"
                >
                  <Play size={12} fill="currentColor" />
                  Try demo first
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Your business deserves <span className="text-[#4F6EF6]">better tools</span>
          </h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Join hundreds of African businesses already using MADIS to run smarter, faster, and more profitably.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-[#4F6EF6] text-white font-black px-10 py-5 rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-105 text-lg shadow-[0_0_40px_rgba(79,110,246,0.3)]"
          >
            Get Started Free
            <ChevronRight size={20} />
          </button>
          <p className="text-white/20 text-xs mt-4">14-day free trial · No card · KSh 1,000/yr after</p>
        </motion.div>
      </section>

      {/* Demo Picker Modal */}
      <AnimatePresence>
        {showDemoPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setShowDemoPicker(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="bg-[#0C1220] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-white">Choose a Demo</h3>
                  <p className="text-white/40 text-sm mt-0.5">Fully interactive · No login needed</p>
                </div>
                <button onClick={() => setShowDemoPicker(false)} className="p-2 text-white/30 hover:text-white transition-colors rounded-xl">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { setShowDemoPicker(false); onDemo('bar'); }}
                  className="w-full flex items-start gap-4 p-5 bg-white/4 hover:bg-[#4F6EF6]/10 border border-white/8 hover:border-[#4F6EF6]/30 rounded-2xl transition-all group text-left"
                >
                  <div className="w-11 h-11 bg-[#4F6EF6]/15 rounded-xl flex items-center justify-center group-hover:bg-[#4F6EF6]/25 transition-colors shrink-0">
                    <Wine size={20} className="text-[#4F6EF6]" />
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">The Grand Bar</p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">Bar & nightclub POS — tabs, drinks, staff leaderboard, M-Pesa.</p>
                  </div>
                </button>

                <button
                  onClick={() => { setShowDemoPicker(false); onDemo('spa'); }}
                  className="w-full flex items-start gap-4 p-5 bg-white/4 hover:bg-[#4F6EF6]/10 border border-white/8 hover:border-[#4F6EF6]/30 rounded-2xl transition-all group text-left"
                >
                  <div className="w-11 h-11 bg-[#4F6EF6]/15 rounded-xl flex items-center justify-center group-hover:bg-[#4F6EF6]/25 transition-colors shrink-0">
                    <Scissors size={20} className="text-[#4F6EF6]" />
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">Serenity Spa & Salon</p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">Service business POS — beauty treatments, massage, hair & nails.</p>
                  </div>
                </button>

                <button
                  onClick={() => { setShowDemoPicker(false); onDemo('gym'); }}
                  className="w-full flex items-start gap-4 p-5 bg-white/4 hover:bg-[#4F6EF6]/10 border border-white/8 hover:border-[#4F6EF6]/30 rounded-2xl transition-all group text-left"
                >
                  <div className="w-11 h-11 bg-[#4F6EF6]/15 rounded-xl flex items-center justify-center group-hover:bg-[#4F6EF6]/25 transition-colors shrink-0">
                    <Dumbbell size={20} className="text-[#4F6EF6]" />
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">Apex Fitness Centre</p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">Fitness & gym POS — memberships, personal training, classes.</p>
                  </div>
                </button>
              </div>

              <div className="mt-5 pt-5 border-t border-white/5 text-center">
                <button
                  onClick={() => { setShowDemoPicker(false); onGetStarted(); }}
                  className="text-[#4F6EF6] text-sm font-black hover:underline"
                >
                  Skip demo — start my free 14-day trial →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#4F6EF6] rounded-md flex items-center justify-center">
              <BarChart2 size={12} className="text-white" />
            </div>
            <span className="font-black text-sm tracking-tight">MADIS</span>
            <span className="text-white/25 text-xs hidden sm:inline">Market Analysis &amp; Data Insight System</span>
          </div>
          <div className="flex items-center gap-6 text-white/20 text-xs">
            <span>14-day free trial</span>
            <span>·</span>
            <span>KSh 1,000/year</span>
            <span>·</span>
            <span>Built by <span className="text-[#4F6EF6]/70 font-bold">August</span></span>
            <span>·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
