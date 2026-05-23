import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2, CheckCircle2, Phone, LogOut, Banknote, AlertCircle,
  Globe, Smartphone,
} from 'lucide-react';

interface Props {
  email: string;
  onActivate: () => Promise<void>;
  onLogout: () => void;
  error?: string;
  clearError?: () => void;
  trialExpired?: boolean;
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

type PayMethod = 'mpesa' | 'paypal';
type Step = 'plan' | 'pay' | 'processing' | 'confirm' | 'done';

export function SubscriptionPage({ email, onActivate, onLogout, error, clearError, trialExpired }: Props) {
  const [payMethod, setPayMethod] = useState<PayMethod>('paypal');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<Step>('plan');
  const [localError, setLocalError] = useState('');
  const [checkoutId, setCheckoutId] = useState('');
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (error && ['processing', 'confirm', 'done'].includes(step)) {
      setLocalError(error);
      setStep('pay');
      clearError?.();
    }
  }, [error]);

  // Load PayPal SDK and render button when on pay step with PayPal method
  useEffect(() => {
    if (step !== 'pay' || payMethod !== 'paypal') return;

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setLocalError('PayPal is not yet configured. Please use M-Pesa or contact support.');
      return;
    }

    function renderButton() {
      const container = document.getElementById('paypal-button-container');
      if (!container || !(window as any).paypal) return;
      container.innerHTML = '';
      (window as any).paypal.Buttons({
        style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'pay', height: 45 },
        createOrder: async () => {
          const r = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const d = await r.json();
          if (!d.id) throw new Error(d.error || 'Could not create PayPal order');
          return d.id;
        },
        onApprove: async (data: any) => {
          setStep('processing');
          try {
            const r = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID }),
            });
            const d = await r.json();
            if (d.success) {
              setStep('done');
              setTimeout(() => onActivate(), 1500);
            } else {
              setLocalError(d.error || 'Payment capture failed. Please contact support.');
              setStep('pay');
            }
          } catch (e: any) {
            setLocalError(e.message || 'Payment failed. Please try again.');
            setStep('pay');
          }
        },
        onError: () => {
          setLocalError('PayPal payment failed. Please try again or use M-Pesa.');
        },
      }).render('#paypal-button-container');
    }

    if ((window as any).paypal) {
      renderButton();
      return;
    }

    const existing = document.getElementById('paypal-sdk-script');
    if (existing) {
      existing.addEventListener('load', renderButton);
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = renderButton;
    document.head.appendChild(script);
  }, [step, payMethod]);

  // Initiate M-Pesa STK push
  const handleMpesa = async () => {
    setLocalError('');
    setStep('processing');
    try {
      const r = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || 'STK push failed. Please try again.');
      setCheckoutId(d.checkoutRequestId);
      setStep('confirm');
    } catch (e: any) {
      setLocalError(e.message);
      setStep('pay');
    }
  };

  // Poll Daraja for STK confirmation
  useEffect(() => {
    if (step !== 'confirm' || !checkoutId) return;
    let attempts = 0;
    const MAX_ATTEMPTS = 20;

    pollRef.current = window.setInterval(async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(pollRef.current!);
        setLocalError('Confirmation timed out. If you paid, please contact support.');
        setStep('pay');
        return;
      }
      try {
        const r = await fetch('/api/mpesa/stk-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestId: checkoutId }),
        });
        const d = await r.json();
        const code = String(d.resultCode);
        if (code === '0') {
          clearInterval(pollRef.current!);
          setStep('done');
          setTimeout(() => onActivate(), 1500);
        } else if (code === '1032') {
          clearInterval(pollRef.current!);
          setLocalError('Payment was cancelled. Please try again.');
          setStep('pay');
        }
        // 1037 = timeout from Safaricom side, keep polling
      } catch {
        // network error — keep polling
      }
    }, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, checkoutId]);

  const cancelConfirm = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep('pay');
    setLocalError('');
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

          {/* ── Plan step ── */}
          {step === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-[#0C1220] border border-[#4F6EF6]/20 rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-4">
                <div className="text-center mb-5 sm:mb-6">
                  {trialExpired && (
                    <div className="mb-4 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-amber-400 text-xs font-black uppercase tracking-widest">Your 14-day free trial has ended</p>
                      <p className="text-amber-400/60 text-[10px] mt-0.5">Subscribe to keep your data and continue using MADIS</p>
                    </div>
                  )}
                  <p className="text-white/35 text-xs uppercase tracking-widest mb-3">Annual Subscription</p>
                  <div className="flex items-end justify-center gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-white">$10</span>
                    <span className="text-white/40 text-lg mb-1">/year</span>
                  </div>
                  <p className="text-white/30 text-sm mt-1.5">≈ KSh 1,300 &nbsp;·&nbsp; Less than $1/month</p>
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

          {/* ── Pay step ── */}
          {step === 'pay' && (
            <motion.div key="pay" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3 sm:space-y-4">
              <div className="bg-[#0C1220] border border-white/7 rounded-2xl sm:rounded-3xl p-5 sm:p-6">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Choose Payment Method</p>

                {/* Method tabs */}
                <div className="flex gap-2 sm:gap-3 mb-5">
                  {([
                    ['paypal', Globe, 'PayPal', 'Worldwide'],
                    ['mpesa', Smartphone, 'M-Pesa', 'Kenya only'],
                  ] as [PayMethod, any, string, string][]).map(([m, Icon, label, sub]) => (
                    <button
                      key={m}
                      onClick={() => { setPayMethod(m); setLocalError(''); }}
                      className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl border text-xs font-bold transition-all ${
                        payMethod === m
                          ? 'bg-[#4F6EF6]/10 border-[#4F6EF6]/45 text-[#4F6EF6]'
                          : 'border-white/8 text-white/35 hover:border-white/18 hover:text-white/55'
                      }`}
                    >
                      <Icon size={17} />
                      <span>{label}</span>
                      <span className="text-[9px] opacity-60 font-normal">{sub}</span>
                    </button>
                  ))}
                </div>

                {/* PayPal */}
                {payMethod === 'paypal' && (
                  <div className="space-y-3">
                    <p className="text-white/45 text-xs leading-relaxed">
                      Pay <strong className="text-white/70">$10 USD</strong> securely via PayPal. Credit/debit cards also accepted through PayPal checkout.
                    </p>
                    <div id="paypal-button-container" className="min-h-[50px] rounded-xl overflow-hidden" />
                  </div>
                )}

                {/* M-Pesa */}
                {payMethod === 'mpesa' && (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-white/35 text-xs font-bold uppercase tracking-widest block mb-1.5">Safaricom Number</label>
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
                      <strong className="text-white/60">How it works:</strong> Enter your Safaricom number. You'll receive an STK push to pay <strong className="text-[#4F6EF6]">KSh 1,300</strong> (~$10). Confirm with your M-Pesa PIN to activate.
                    </div>
                  </div>
                )}
              </div>

              {/* Total bar */}
              <div className="flex items-center gap-2 bg-[#4F6EF6]/6 border border-[#4F6EF6]/15 rounded-xl px-4 py-3 text-xs text-[#4F6EF6]/70">
                <Banknote size={13} className="shrink-0" />
                Total: <strong className="text-[#4F6EF6]">$10 USD</strong>
                {payMethod === 'mpesa' && <span className="text-white/30 ml-1">(≈ KSh 1,300)</span>}
                &nbsp;—&nbsp; 1-year MADIS access
              </div>

              <AnimatePresence>
                {localError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3"
                  >
                    <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400 text-xs leading-relaxed">{localError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {payMethod === 'mpesa' && (
                <button
                  onClick={handleMpesa}
                  disabled={phone.replace(/\D/g, '').length < 9}
                  className="w-full bg-[#4F6EF6] text-white font-black py-3.5 sm:py-4 rounded-xl hover:bg-[#3D5CE4] transition-all disabled:opacity-35 disabled:cursor-not-allowed text-sm shadow-[0_0_20px_rgba(79,110,246,0.2)]"
                >
                  Send M-Pesa STK Push
                </button>
              )}

              <button
                onClick={() => { setStep('plan'); setLocalError(''); }}
                className="w-full text-white/25 text-sm hover:text-white/45 transition-colors py-2"
              >
                ← Back to plan
              </button>
            </motion.div>
          )}

          {/* ── Processing ── */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 sm:gap-6 py-12 sm:py-14">
              <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#4F6EF6]/20 border-t-[#4F6EF6] rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-white font-bold text-sm sm:text-base">
                  {payMethod === 'mpesa' ? 'Sending STK push...' : 'Processing payment...'}
                </p>
                <p className="text-white/35 text-xs sm:text-sm mt-1">Please wait</p>
              </div>
            </motion.div>
          )}

          {/* ── Confirm (M-Pesa polling) ── */}
          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 py-10">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center">
                <Smartphone size={28} className="text-emerald-400" />
              </div>
              <div className="text-center px-4">
                <p className="text-white font-black text-base mb-2">Check your phone</p>
                <p className="text-white/45 text-sm leading-relaxed">
                  An M-Pesa STK push has been sent to{' '}
                  <strong className="text-white/70">{phone}</strong>.{' '}
                  Enter your M-Pesa PIN to confirm.
                </p>
              </div>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <div className="w-4 h-4 border-2 border-white/20 border-t-[#4F6EF6] rounded-full animate-spin" />
                Waiting for confirmation…
              </div>
              <button
                onClick={cancelConfirm}
                className="text-white/20 text-xs hover:text-white/40 transition-colors mt-2"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-12 sm:py-14">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#4F6EF6] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,110,246,0.45)]">
                <CheckCircle2 size={30} className="text-white" />
              </div>
              <p className="text-white font-black text-lg sm:text-xl">Payment Successful!</p>
              <p className="text-white/35 text-sm">Setting up your workspace…</p>
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
