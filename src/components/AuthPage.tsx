import { useState } from 'react';
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
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-4">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#00FF88] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.3)] mb-4">
            <BarChart2 size={28} className="text-black" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">MADIS</h1>
          <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.25em] mt-1">
            Market Analysis & Data Insight System
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
          {(['signup', 'signin'] as const).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                tab === t
                  ? 'bg-[#00FF88] text-black shadow'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {t === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                required
                placeholder="you@business.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 focus:bg-white/8 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError(); }}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 focus:bg-white/8 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#00FF88] text-black font-black py-3.5 rounded-xl hover:bg-[#00e87a] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-[0_0_20px_rgba(0,255,136,0.2)]"
          >
            {isSubmitting ? 'Please wait...' : tab === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/25 text-xs">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white/80 font-bold py-3.5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 text-sm"
        >
          <Chrome size={18} />
          Continue with Google
        </button>

        <p className="text-center text-white/25 text-xs mt-6">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </motion.div>

      <p className="absolute bottom-6 text-white/20 text-xs">
        Built by <span className="text-white/40 font-bold">August</span>
      </p>
    </div>
  );
}
