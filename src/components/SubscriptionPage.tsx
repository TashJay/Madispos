import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart2, CheckCircle2, Phone, LogOut, CreditCard, Banknote
} from 'lucide-react';

interface Props {
  email: string;
  onActivate: () => Promise<void>;
  onLogout: () => void;
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

export function SubscriptionPage({ email, onActivate, onLogout }: Props) {
  const [payMethod, setPayMethod] = useState<PayMethod>('mpesa');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [step, setStep] = useState<'plan' | 'pay' | 'processing' | 'done'>('plan');

  const handlePay = async () => {
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
    <div className="min-h-screen bg-[#07090F] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#4F6EF6]/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#4F6EF6] rounded-2xl flex items-center justify-center shadow-[0_0_28px_rgba(79,110,246,0.4)] mb-4">
            <BarChart2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">MADIS</h1>
          <p className="text-white/25 text-[10px] font-mono uppercase tracking-[0.2em] mt-1">
            Market Analysis &amp; Data Insight System
          </p>
        </div>

        {step === 'plan' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-[#0C1220] border border-[#4F6EF6]/20 rounded-3xl p-7 mb-4">
              <div className="text-center mb-6">
                <p className="text-white/35 text-xs uppercase tracking-widest mb-3">Annual Subscription</p>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl font-black text-white">KSh 1,000</span>
                </div>
                <p className="text-white/30 text-sm mt-1.5">per year &nbsp;·&nbsp; ≈ $1 USD</p>
              </div>
              <ul className="space-y-2.5 mb-7">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                    <CheckCircle2 size={15} className="text-[#4F6EF6] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setStep('pay')}
                className="w-full bg-[#4F6EF6] text-white font-black py-4 rounded-xl hover:bg-[#3D5CE4] transition-all text-sm shadow-[0_0_20px_rgba(79,110,246,0.25)]"
              >
                Proceed to Payment
              </button>
            </div>
            <p className="text-center text-white/20 text-xs">
              Signed in as <span className="text-white/40">{email}</span>
            </p>
          </motion.div>
        )}

        {step === 'pay' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-[#0C1220] border border-white/7 rounded-3xl p-6">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Payment Method</p>
              <div className="flex gap-3 mb-5">
                {([['mpesa', Phone, 'M-Pesa'], ['card', CreditCard, 'Card']] as [PayMethod, any, string][]).map(([m, Icon, label]) => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${
                      payMethod === m
                        ? 'bg-[#4F6EF6]/10 border-[#4F6EF6]/45 text-[#4F6EF6]'
                        : 'border-white/8 text-white/35 hover:border-white/18 hover:text-white/55'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              {payMethod === 'mpesa' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white/35 text-xs font-bold uppercase tracking-widest block mb-1.5">M-Pesa Phone Number</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        placeholder="0712 345 678"
                        className="w-full bg-white/4 border border-white/8 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-xs text-white/45 leading-relaxed">
                    <strong className="text-white/60">How it works:</strong> Enter your Safaricom number. You'll receive an STK push to pay <strong className="text-[#4F6EF6]">KSh 1,000</strong>. Confirm with your M-Pesa PIN to activate your subscription.
                  </div>
                </div>
              )}

              {payMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-white/35 text-xs font-bold uppercase tracking-widest block mb-1.5">Card Number</label>
                    <div className="relative">
                      <CreditCard size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(formatCard(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full bg-white/4 border border-white/8 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 transition-all text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-white/35 text-xs font-bold uppercase tracking-widest block mb-1.5">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full bg-white/4 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 transition-all text-sm font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-white/35 text-xs font-bold uppercase tracking-widest block mb-1.5">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full bg-white/4 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 transition-all text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-[#4F6EF6]/6 border border-[#4F6EF6]/15 rounded-xl px-4 py-3 text-xs text-[#4F6EF6]/70">
              <Banknote size={14} />
              Total: <strong className="text-[#4F6EF6]">KSh 1,000</strong> &nbsp;—&nbsp; 1-year MADIS access
            </div>

            <button
              onClick={handlePay}
              disabled={payMethod === 'mpesa' ? phone.length < 9 : cardNumber.length < 14}
              className="w-full bg-[#4F6EF6] text-white font-black py-4 rounded-xl hover:bg-[#3D5CE4] transition-all disabled:opacity-35 disabled:cursor-not-allowed text-sm shadow-[0_0_20px_rgba(79,110,246,0.2)]"
            >
              Pay KSh 1,000 Now
            </button>

            <button
              onClick={() => setStep('plan')}
              className="w-full text-white/25 text-sm hover:text-white/45 transition-colors py-2"
            >
              Back to plan
            </button>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 py-14">
            <div className="w-16 h-16 border-4 border-[#4F6EF6]/20 border-t-[#4F6EF6] rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-white font-bold">Processing payment...</p>
              <p className="text-white/35 text-sm mt-1">
                {payMethod === 'mpesa' ? 'Check your phone for the STK push.' : 'Verifying card details.'}
              </p>
            </div>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-14"
          >
            <div className="w-16 h-16 bg-[#4F6EF6] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,110,246,0.45)]">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <p className="text-white font-black text-xl">Payment Successful!</p>
            <p className="text-white/35 text-sm">Setting up your workspace...</p>
          </motion.div>
        )}

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 mx-auto mt-6 text-white/20 hover:text-white/45 text-xs transition-colors"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>

      <p className="absolute bottom-6 text-white/15 text-xs z-10">
        Built by <span className="text-white/35 font-bold">August</span>
      </p>
    </div>
  );
}
