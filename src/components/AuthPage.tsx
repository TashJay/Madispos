import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart2, Mail, Lock, Eye, EyeOff, ArrowLeft, Chrome } from 'lucide-react';

interface Props {
  mode?: 'signin' | 'signup';
  onSignInWithEmail: (email: string, password: string) => Promise<void>;
  onSignUpWithEmail: (email: string, password: string) => Promise<void>;
  onSignInWithGoogle: () => Promise<void>;
  onBack: () => void;
  error: string;
  clearError: () => void;
}

export function AuthPage({ mode = 'signup', onSignInWithEmail, onSignUpWithEmail, onSignInWithGoogle, onBack, error, clearError }: Props) {
  const [tab, setTab] = useState<'signin' | 'signup'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    try {
      if (tab === 'signin') {
        await onSignInWithEmail(email, password);
      } else {
        await onSignUpWithEmail(email, password);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    clearError();
    setIsSubmitting(true);
    try {
      await onSignInWithGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchTab = (t: 'signin' | 'signup') => {
    clearError();
    setTab(t);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#07090F] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#4F6EF6]/6 rounded-full blur-[120px] pointer-events-none" />

      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/35 hover:text-white transition-colors text-sm z-10"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#4F6EF6] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,110,246,0.4)] mb-4">
            <BarChart2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">MADIS</h1>
          <p className="text-white/25 text-[10px] font-mono uppercase tracking-[0.25em] mt-1">
            Market Analysis &amp; Data Insight System
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/5 border border-white/7 rounded-xl p-1 mb-6">
          {(['signup', 'signin'] as const).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                tab === t
                  ? 'bg-[#4F6EF6] text-white shadow-[0_0_12px_rgba(79,110,246,0.3)]'
                  : 'text-white/45 hover:text-white/70'
              }`}
            >
              {t === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                required
                placeholder="you@business.com"
                className="w-full bg-white/5 border border-white/8 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 focus:bg-white/7 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError(); }}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/8 rounded-xl py-3 pl-10 pr-10 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 focus:bg-white/7 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-red-500/8 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#4F6EF6] text-white font-black py-3.5 rounded-xl hover:bg-[#3D5CE4] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-[0_0_20px_rgba(79,110,246,0.25)]"
          >
            {isSubmitting ? 'Please wait...' : tab === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-white/20 text-xs">or</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 bg-white/4 border border-white/8 text-white/75 font-bold py-3.5 rounded-xl hover:bg-white/8 hover:border-white/15 transition-all disabled:opacity-50 text-sm"
        >
          <Chrome size={17} />
          Continue with Google
        </button>

        <p className="text-center text-white/20 text-xs mt-6">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </motion.div>

      <p className="absolute bottom-6 text-white/20 text-xs z-10 font-bold uppercase tracking-widest">
        Powered by <span className="text-[#4F6EF6]/70">August</span>
      </p>
    </div>
  );
}
