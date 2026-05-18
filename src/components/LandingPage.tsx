import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2, ShieldCheck, Zap, Users, TrendingUp, Globe,
  Coffee, Dumbbell, Scissors, Pill, Home, Wrench, ShoppingBag,
  UtensilsCrossed, Wine, CheckCircle2, ArrowRight, Play,
  Star, Moon, Building2, Smartphone, X
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
  onDemo: (type: 'bar' | 'spa' | 'gym') => void;
}

const features = [
  { icon: BarChart2,   title: 'Real-Time Analytics',    desc: 'Track sales, revenue and stock levels as they happen — no delays, no guesswork.' },
  { icon: ShieldCheck, title: 'Private & Isolated',      desc: 'Each business gets its own secure data environment. Your data belongs to you alone.' },
  { icon: Users,       title: 'Staff Management',        desc: 'Add staff with role-based PIN access. Supervisors, cashiers, and owners — all controlled.' },
  { icon: TrendingUp,  title: 'Business Intelligence',   desc: 'Hourly trends, top sellers, staff performance — insight that drives real decisions.' },
  { icon: Globe,       title: 'Works Everywhere',        desc: 'Runs on any device — phone, tablet, or desktop. Works even when you go offline.' },
  { icon: Zap,         title: 'Lightning Fast',          desc: 'Instant checkout flow designed to keep queues short and customers happy.' },
  { icon: Smartphone,  title: 'PWA — Install Anywhere',  desc: 'Install on any phone or tablet like a native app. No app store required.' },
  { icon: Star,        title: 'M-Pesa Integration',      desc: 'Record M-Pesa and cash payments side by side. Built for the Kenyan market.' },
];

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
  'Full POS system for your business type',
  'Unlimited staff accounts & roles',
  'Real-time inventory tracking',
  'Sales reports & business analytics',
  'Debt, tab & order management',
  'Offline mode — works without internet',
  'M-Pesa & cash payment recording',
  'Full audit trail for all transactions',
];

const steps = [
  { step: '01', title: 'Sign Up',          desc: 'Create your account with email or Google in under 30 seconds.' },
  { step: '02', title: 'Choose Business',  desc: 'Select your business type — bar, spa, restaurant, shop, and more.' },
  { step: '03', title: 'Subscribe',        desc: 'Pay KSh 1,000/year via M-Pesa or card. Less than KSh 3 a day.' },
  { step: '04', title: 'Start Selling',    desc: 'Your personal POS dashboard is ready. Add staff and inventory.' },
];

export function LandingPage({ onGetStarted, onSignIn, onDemo }: Props) {
  const [showDemoPicker, setShowDemoPicker] = useState(false);

  const openDemoPicker = () => setShowDemoPicker(true);

  return (
    <div className="min-h-screen bg-[#07090F] text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#07090F]/80 backdrop-blur-xl border-b border-white/5">
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
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-28 px-4 sm:px-6 max-w-6xl mx-auto text-center relative">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#4F6EF6]/8 rounded-full blur-[100px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="inline-flex items-center gap-2 bg-[#4F6EF6]/10 border border-[#4F6EF6]/20 rounded-full px-4 py-1.5 text-[#4F6EF6] text-xs font-bold uppercase tracking-widest mb-8">
            <Star size={11} fill="currentColor" />
            The Smart POS Platform — Built for Africa
          </div>

          <h1 className="text-6xl sm:text-8xl font-black tracking-tight mb-4 leading-none bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            MADIS
          </h1>
          <p className="text-white/35 text-xs font-mono uppercase tracking-[0.35em] mb-7">
            Market Analysis &amp; Data Insight System
          </p>
          <p className="text-white/55 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            One platform for every business. Manage sales, staff, stock and insights — all from a single dashboard built for the way you work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-[#4F6EF6] text-white font-black px-8 py-4 rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-105 text-base shadow-[0_0_40px_rgba(79,110,246,0.35)]"
            >
              Start Free — KSh 1,000/yr
              <ArrowRight size={18} />
            </button>
            <button
              onClick={openDemoPicker}
              className="flex items-center gap-2 border border-white/15 bg-white/5 text-white/80 font-bold px-8 py-4 rounded-xl hover:border-[#4F6EF6]/40 hover:text-white hover:bg-white/8 transition-all text-base"
            >
              <Play size={16} fill="currentColor" className="text-[#4F6EF6]" />
              Try Live Demo
            </button>
          </div>
          <p className="text-white/25 text-xs">
            Less than KSh 3 per day &nbsp;·&nbsp; $1 USD per year &nbsp;·&nbsp; No credit card required to demo
          </p>
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
            Up and running in <span className="text-[#4F6EF6]">4 steps</span>
          </h2>
          <p className="text-white/45 text-center mb-14 max-w-lg mx-auto text-sm">
            No technical setup. No expensive hardware. Just open your browser.
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
                <span className="text-[#4F6EF6]/30 text-5xl font-black absolute top-4 right-5 leading-none select-none">{step}</span>
                <div className="w-10 h-10 bg-[#4F6EF6]/10 rounded-xl flex items-center justify-center mb-5 border border-[#4F6EF6]/15">
                  <span className="text-[#4F6EF6] font-black text-sm">{step}</span>
                </div>
                <h3 className="font-bold text-white mb-2 text-base">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
            Everything you need to <span className="text-[#4F6EF6]">run your business</span>
          </h2>
          <p className="text-white/45 text-center mb-14 max-w-lg mx-auto text-sm">
            No complex setup. No expensive hardware. Just open your browser and start selling.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/3 border border-white/7 rounded-2xl p-5 hover:border-[#4F6EF6]/30 transition-colors group"
              >
                <div className="w-9 h-9 bg-[#4F6EF6]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#4F6EF6]/18 transition-colors border border-[#4F6EF6]/15">
                  <Icon size={18} className="text-[#4F6EF6]" />
                </div>
                <h3 className="font-bold text-white mb-1.5 text-sm">{title}</h3>
                <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Demo CTA Banner */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
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
            <h2 className="text-2xl sm:text-3xl font-black mb-3">See MADIS in action — no sign-up needed</h2>
            <p className="text-white/55 max-w-md mx-auto mb-7 text-sm leading-relaxed">
              Jump straight into a live demo with realistic data. Browse inventory, process sales, check reports — experience the full system for free.
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

      {/* Pricing */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">Simple, honest pricing</h2>
          <p className="text-white/45 mb-14 text-sm">One plan. Everything included. No hidden fees.</p>
          <div className="max-w-sm mx-auto bg-[#0C1220] border border-[#4F6EF6]/25 rounded-3xl p-8 shadow-[0_0_60px_rgba(79,110,246,0.08)] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#4F6EF6]/8 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative">
              <div className="inline-block bg-[#4F6EF6]/15 border border-[#4F6EF6]/25 text-[#4F6EF6] text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1 mb-5">
                Most Popular
              </div>
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-5xl font-black text-white">KSh 1,000</span>
              </div>
              <p className="text-white/35 text-sm mb-1">per year &nbsp;·&nbsp; ≈ $1 USD</p>
              <p className="text-white/20 text-xs mb-8">Billed annually. Cancel any time.</p>
              <ul className="space-y-3 text-left mb-8">
                {pricingFeatures.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/65">
                    <CheckCircle2 size={15} className="text-[#4F6EF6] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full bg-[#4F6EF6] text-white font-black py-4 rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-[1.02] text-base shadow-[0_0_30px_rgba(79,110,246,0.25)]"
              >
                Get Started Now
              </button>
              <button
                onClick={openDemoPicker}
                className="w-full mt-3 text-white/40 hover:text-white/70 text-sm transition-colors py-2 flex items-center justify-center gap-1.5"
              >
                <Play size={12} fill="currentColor" />
                Try demo first
              </button>
            </div>
          </div>
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
                  <p className="text-white/40 text-sm mt-0.5">Pick a business type to explore</p>
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
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">Bar & nightclub POS — tabs, drinks, staff leaderboard, M-Pesa payments.</p>
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
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">Service business POS — beauty treatments, massage, hair & nail services.</p>
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
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">Fitness & gym POS — memberships, personal training, classes, supplements.</p>
                  </div>
                </button>
              </div>

              <p className="text-white/20 text-[10px] text-center mt-5">
                No account required &nbsp;·&nbsp; Fully interactive &nbsp;·&nbsp; Simulated data only
              </p>
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
          <p className="text-white/20 text-xs">
            Powered by <span className="text-[#4F6EF6]/70 font-bold">August</span> &nbsp;·&nbsp; © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
