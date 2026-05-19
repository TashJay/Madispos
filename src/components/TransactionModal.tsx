/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Check, X, Loader2, Smartphone, Zap, CreditCard, Printer } from 'lucide-react';

interface TransactionModalProps {
  total: number;
  onConfirm: (phone?: string) => void;
  onCancel: () => void;
  onPrint?: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ total, onConfirm, onCancel, onPrint }) => {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setStep('processing');
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          onConfirm(phone);
        }, 1500);
      }, 2500);
    }
  };

  const handleCashSettle = () => {
    setStep('success');
    setTimeout(() => {
      onConfirm();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm themed-bg-secondary border themed-border rounded-[3rem] p-10 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#00FF88]/30" />
        
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col items-center text-center mb-10 relative">
                {onPrint && (
                  <button 
                    onClick={onPrint}
                    type="button"
                    className="absolute -top-4 -right-4 p-3 bg-[#00FF88]/10 themed-text border themed-border rounded-2xl hover:bg-[#00FF88]/20 transition-all shadow-sm"
                    title="Print Preliminary Receipt"
                  >
                    <Printer size={20} />
                  </button>
                )}
                <div className="w-16 h-16 bg-[#00FF88]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#00FF88]/20 text-[#00FF88] shadow-lg">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black themed-text uppercase tracking-tight">Payment</h3>
              </div>

              <div className="mb-10 p-6 bg-black/5 rounded-3xl border themed-border flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                   <Zap size={60} className="themed-text" />
                 </div>
                 <div className="relative z-10">
                   <p className="text-[9px] themed-text-dim uppercase font-black tracking-widest mb-1">Amount Due</p>
                   <p className="text-3xl font-black themed-text tracking-tighter leading-none">KES {total.toLocaleString()}</p>
                 </div>
                 <div className="text-right relative z-10">
                   <p className="text-[9px] themed-text-dim uppercase font-black tracking-widest mb-1">Status</p>
                   <p className="text-xs font-black text-[#00FF88] animate-pulse">PENDING</p>
                 </div>
              </div>

              <div className="space-y-6">
                <button 
                  onClick={handleCashSettle}
                  className="w-full py-5 bg-amber-400 text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] hover:bg-amber-300 active:scale-95 transition-all shadow-[0_8px_20px_rgba(251,191,36,0.35)] flex items-center justify-center gap-3"
                >
                  <CreditCard size={18} />
                  Settle with Cash
                </button>

                <div className="relative py-4 flex items-center">
                  <div className="flex-grow border-t themed-border"></div>
                  <span className="flex-shrink mx-4 text-[9px] themed-text-dim font-black uppercase tracking-widest">or M-Pesa</span>
                  <div className="flex-grow border-t themed-border"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] themed-text-dim uppercase font-black tracking-[0.3em] block">M-Pesa Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 themed-text-dim opacity-30" size={18} />
                      <input 
                        type="tel"
                        autoFocus
                        required
                        placeholder="e.g. 0712345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full themed-bg-primary border-2 border-[#00FF88]/20 rounded-2xl py-5 pl-14 pr-5 themed-text focus:outline-none focus:border-[#00FF88] transition-all font-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button 
                      type="button" 
                      onClick={onCancel}
                      className="py-4 bg-black/5 themed-text border themed-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="py-4 bg-[#00FF88] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,255,136,0.3)]"
                    >
                      Send M-Pesa
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16 flex flex-col items-center text-center">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-[#00FF88]/20 blur-2xl rounded-full scale-150 animate-pulse" />
                <Loader2 className="w-20 h-20 text-[#00FF88] animate-spin relative z-10" />
              </div>
              <h3 className="text-xl font-black themed-text mb-3 uppercase tracking-tight">Processing M-Pesa</h3>
              <p className="themed-text-dim text-xs font-medium max-w-[220px]">Awaiting M-Pesa confirmation on the customer's phone...</p>
              
              <div className="mt-12 w-full bg-black/5 rounded-full h-1.5 overflow-hidden border themed-border">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '100%' }}
                   transition={{ duration: 2.5, ease: "easeInOut" }}
                   className="h-full bg-[#00FF88] shadow-[0_0_15px_#00FF88]"
                 />
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-16 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#00FF88] rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_15px_40px_rgba(0,255,136,0.5)] rotate-12">
                <Check className="text-black w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black themed-text mb-3 uppercase tracking-tighter">Payment Complete</h3>
              <p className="themed-text-dim text-[10px] font-black uppercase tracking-[0.4em]">Transaction Recorded</p>
              <div className="mt-8 p-3 bg-[#00FF88]/5 rounded-xl border border-[#00FF88]/10">
                 <p className="text-[10px] font-mono font-black text-[#00FF88] uppercase">REF: QRD91LX01{Math.floor(Math.random() * 100)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
