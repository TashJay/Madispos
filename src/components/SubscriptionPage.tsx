import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2, CheckCircle2, Phone, LogOut, CreditCard, Banknote, AlertCircle
} from 'lucide-react';

interface Props {
  email: string;
  onActivate: () => Promise<void>;
  onLogout: () => void;
  error?: string;
  clearError?: () => void;
}

const features = [
  'Full POS system for your business type',
  'Real-time inventory & stock tracking',
  'Staff roles & PIN-based access',
  'Sales analytics & business reports',
  'Tab, debt & order management',
  'Offline mode — works without internet',
  'M-Pesa & cash payment recording',
  'Audit trail for all transactions',
];

type PayMethod = 'mpesa' | 'card';

export function SubscriptionPage({ email, onActivate, onLogout, error, clearError }: Props) {
  const [payMethod, setPayMethod] = useState<PayMethod>('mpesa');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [step, setStep] = useState<'plan' | 'pay' | 'processing' | 'done'>('plan');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error && step === 'done') {
      setLocalError(error);
      setStep('pay');
      clearError?.();
    }
  }, [error, step, clearError]);

  const handlePay = async () => {
    setLocalError('');
    setStep('processing');
    await new Promise(r => setTimeout(r, 2500));
    setStep('done');
    await new Promise(r => setTimeout(r, 900));
    await onActivate();
  };

  const formatCard = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  return (
    <div className="min-h-screen bg-[#07090F] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[320px] sm:w-[500px] h-[300px] sm:h-[400px] bg-[#4F6EF6]/6 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-lg relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#4F6EF6] rounded-2xl flex items-center justify-center shadow-[0_0_28px_rgba(79,110,246,0.4)] mb-3 sm:mb-4">
            <BarChart2 size={22} className="text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">MADIS</h1>
          <p className="text-white/25 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.2em] mt-1">
            Market Analysis &amp; Data Insight System
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* Plan step */}
          {step === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-[#0C1220] border border-[#4F6EF6]/20 rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-4">
                <div className="text-center mb-5 sm:mb-6">
                  <p className="text-white/35 text-xs uppercase tracking-widest mb-3">Annual Subscription</p>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white">KSh 1,000</span>
                  </div>
                  <p className="text-white/30 text-sm mt-1.5">per year &nbsp;·&nbsp; ≈ $1 USD</p>
                </div>
                <ul className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-7">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-xs sm:text-sm text-white/60">
                      <CheckCircle2 size={14} className="text-[#4F6EF6] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setStep('pay')}
                  className="w-full bg-[#4F6EF6] text-white font-black py-3.5 sm:py-4 rounded-xl hover:bg-[#3D5CE4] transition-all text-sm shadow-[0_0_20px_rgba(79,110,246,0.25)]"
                >
                  Proceed to Payment
                </button>
              </div>
              <p className="text-center text-white/20 text-xs break-all">
                Signed in as <span className="text-white/40">{email}</span>
              </p>
            </motion.div>
          )}

          {/* Pay step */}
          {step === 'pay' && (
            <motion.div key="pay" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3 sm:space-y-4">
              <div className="bg-[#0C1220] border border-white/7 rounded-2xl sm:rounded-3xl p-5 sm:p-6">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Payment Method</p>
                <div className="flex gap-2 sm:gap-3 mb-5">
                  {([['mpesa', Phone, 'M-Pesa'], ['card', CreditCard, 'Card']] as [PayMethod, any, string][]).map(([m, Icon, label]) => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                        payMethod === m
                          ? 'bg-[#4F6EF6]/10 border-[#4F6EF6]/45 text-[#4F6EF6]'
                          : 'border-white/8 text-white/35 hover:border-white/18 hover:text-white/55'
                      }`}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>

                {payMethod === 'mpesa' && (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-white/35 text-xs font-bold uppercase tracking-widest block mb-1.5">M-Pesa Phone Number</label>
                      <div className="relative">
                        <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
                          placeholder="0712 345 678"
                          className="w-full bg-white/4 border border-white/8 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 sm:p-4 text-xs text-white/45 leading-relaxed">
                      <strong className="text-white/60">How it works:</strong> Enter your Safaricom number. You'll receive an STK push to pay <strong className="text-[#4F6EF6]">KSh 1,000</strong>. Confirm with your M-Pesa PIN to activate.
                    </div>
                  </div>
                )}

                {payMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/35 text-xs font-bold uppercase tracking-widest block mb-1.5">Card Number</label>
                      <div className="relative">
                        <CreditCard size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(formatCard(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          className="w-full bg-white/4 border border-white/8 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 transition-all text-sm font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <div className="flex-1">
                        <label className="text-white/35 text-xs font-bold uppercase tracking-widest block mb-1.5">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className="w-full bg-white/4 border border-white/8 rounded-xl py-3 px-3 sm:px-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 transition-all text-sm font-mono"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-white/35 text-xs font-bold uppercase tracking-widest block mb-1.5">CVV</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          className="w-full bg-white/4 border border-white/8 rounded-xl py-3 px-3 sm:px-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 transition-all text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 bg-[#4F6EF6]/6 border border-[#4F6EF6]/15 rounded-xl px-4 py-3 text-xs text-[#4F6EF6]/70">
                <Banknote size={13} className="shrink-0" />
                Total: <strong className="text-[#4F6EF6]">KSh 1,000</strong> &nbsp;—&nbsp; 1-year MADIS access
              </div>

              <AnimatePresence>
                {localError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3"
                  >
                    <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400 text-xs leading-relaxed">{localError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handlePay}
                disabled={payMethod === 'mpesa' ? phone.length < 9 : cardNumber.length < 14}
                className="w-full bg-[#4F6EF6] text-white font-black py-3.5 sm:py-4 rounded-xl hover:bg-[#3D5CE4] transition-all disabled:opacity-35 disabled:cursor-not-allowed text-sm shadow-[0_0_20px_rgba(79,110,246,0.2)]"
              >
                Pay KSh 1,000 Now
              </button>

              <button
                onClick={() => { setStep('plan'); setLocalError(''); }}
                className="w-full text-white/25 text-sm hover:text-white/45 transition-colors py-2"
              >
                Back to plan
              </button>
            </motion.div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 sm:gap-6 py-12 sm:py-14">
              <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#4F6EF6]/20 border-t-[#4F6EF6] rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-white font-bold text-sm sm:text-base">Processing payment...</p>
                <p className="text-white/35 text-xs sm:text-sm mt-1">
                  {payMethod === 'mpesa' ? 'Check your phone for the STK push.' : 'Verifying card details.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Done */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-12 sm:py-14"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#4F6EF6] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,110,246,0.45)]">
                <CheckCircle2 size={28} className="text-white sm:hidden" />
                <CheckCircle2 size={32} className="text-white hidden sm:block" />
              </div>
              <p className="text-white font-black text-lg sm:text-xl">Payment Successful!</p>
              <p className="text-white/35 text-sm">Setting up your workspace...</p>
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mt-2" />
            </motion.div>
          )}

        </AnimatePresence>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 mx-auto mt-5 sm:mt-6 text-white/20 hover:text-white/45 text-xs transition-colors"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>

      <p className="fixed bottom-4 sm:bottom-6 text-white/15 text-xs z-10">
        Built by <span className="text-white/35 font-bold">August</span>
      </p>
    </div>
  );
}
