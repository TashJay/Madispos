import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2, Wine, Coffee, UtensilsCrossed, Scissors, Dumbbell,
  ShoppingBag, Wrench, Home, Pill, Moon, LogOut, Building2, Check,
  ChevronRight, ChevronLeft, Rocket, Delete
} from 'lucide-react';
import type { BusinessType } from '../types';

interface Props {
  email: string;
  onSave: (businessName: string, businessType: BusinessType, ownerName: string, ownerPin: string) => Promise<void>;
  onLogout: () => void;
}

const BUSINESS_TYPES: { type: BusinessType; icon: any; label: string; desc: string }[] = [
  { type: 'bar',        icon: Wine,            label: 'Bar',            desc: 'Pub, bar or liquor outlet' },
  { type: 'nightclub',  icon: Moon,            label: 'Nightclub',      desc: 'Club, lounge or venue' },
  { type: 'restaurant', icon: UtensilsCrossed, label: 'Restaurant',     desc: 'Full-service dining' },
  { type: 'cafe',       icon: Coffee,          label: 'Café',           desc: 'Coffee shop or café' },
  { type: 'spa',        icon: Scissors,        label: 'Spa & Salon',    desc: 'Beauty, spa or salon' },
  { type: 'gym',        icon: Dumbbell,        label: 'Gym & Fitness',  desc: 'Gym, yoga or fitness studio' },
  { type: 'shop',       icon: ShoppingBag,     label: 'Retail Shop',    desc: 'General merchandise' },
  { type: 'hardware',   icon: Wrench,          label: 'Hardware Store', desc: 'Hardware & supplies' },
  { type: 'rental',     icon: Home,            label: 'Rental / Hotel', desc: 'Rooms, units or accommodation' },
  { type: 'hotel',      icon: Building2,       label: 'Hotel',          desc: 'Hotel with multiple services' },
  { type: 'pharmacy',   icon: Pill,            label: 'Pharmacy',       desc: 'Chemist or pharmacy' },
];

const STEPS = ['Business Type', 'Your Details', 'Owner PIN', 'All Set'];

function PinDots({ value, target }: { value: string; target: number }) {
  return (
    <div className="flex gap-4 justify-center my-6">
      {Array.from({ length: target }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ scale: value.length === i + 1 ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.15 }}
          className={`w-4 h-4 rounded-full border-2 transition-all ${
            i < value.length
              ? 'bg-[#4F6EF6] border-[#4F6EF6] shadow-[0_0_10px_rgba(79,110,246,0.6)]'
              : 'bg-transparent border-white/20'
          }`}
        />
      ))}
    </div>
  );
}

function PinKeypad({ onPress, onDelete }: { onPress: (d: string) => void; onDelete: () => void }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  return (
    <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
      {keys.map((k, i) => {
        if (k === '') return <div key={i} />;
        if (k === '⌫') return (
          <button
            key={i}
            onClick={onDelete}
            className="h-14 rounded-2xl bg-white/5 border border-white/8 text-white/60 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center"
          >
            <Delete size={18} />
          </button>
        );
        return (
          <button
            key={i}
            onClick={() => onPress(k)}
            className="h-14 rounded-2xl bg-white/5 border border-white/8 text-white text-xl font-bold hover:bg-white/10 active:scale-95 transition-all"
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}

export function OnboardingWizard({ email, onSave, onLogout }: Props) {
  const [step, setStep] = useState(0);

  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinStage, setPinStage] = useState<'create' | 'confirm'>('create');
  const [pinError, setPinError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handlePinPress = (digit: string) => {
    if (pinStage === 'create') {
      if (pin.length < 4) setPin(p => p + digit);
    } else {
      if (pinConfirm.length < 4) setPinConfirm(p => p + digit);
    }
  };

  const handlePinDelete = () => {
    if (pinStage === 'create') setPin(p => p.slice(0, -1));
    else setPinConfirm(p => p.slice(0, -1));
  };

  const handlePinNext = () => {
    if (pinStage === 'create') {
      if (pin.length === 4) {
        setPinStage('confirm');
        setPinError('');
      }
    } else {
      if (pin === pinConfirm) {
        setStep(3);
        setPinError('');
      } else {
        setPinError('PINs do not match. Try again.');
        setPinConfirm('');
        setPin('');
        setPinStage('create');
      }
    }
  };

  const handleLaunch = async () => {
    if (!selectedType || !businessName.trim() || !ownerName.trim() || pin.length !== 4) return;
    setIsSaving(true);
    try {
      await onSave(businessName.trim(), selectedType, ownerName.trim(), pin);
    } finally {
      setIsSaving(false);
    }
  };

  const canAdvanceStep0 = !!selectedType;
  const canAdvanceStep1 = businessName.trim().length >= 2 && ownerName.trim().length >= 2;

  return (
    <div className="min-h-screen bg-[#07090F] flex flex-col items-center justify-start px-4 pt-10 pb-24 relative overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#4F6EF6]/6 rounded-full blur-[100px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#4F6EF6] rounded-2xl flex items-center justify-center shadow-[0_0_28px_rgba(79,110,246,0.4)] mb-3">
            <BarChart2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Set Up Your Business</h1>
          <p className="text-white/35 text-sm mt-1">Let's get MADIS ready for you in a few steps.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center gap-1.5 ${i < step ? 'text-[#4F6EF6]' : i === step ? 'text-white' : 'text-white/20'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  i < step ? 'bg-[#4F6EF6] text-white' : i === step ? 'bg-white/15 text-white' : 'bg-white/5 text-white/20'
                }`}>
                  {i < step ? <Check size={10} strokeWidth={3} /> : i + 1}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-[#4F6EF6]/40' : 'bg-white/8'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0 — Business Type */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">What type of business?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
                {BUSINESS_TYPES.map(({ type, icon: Icon, label, desc }, i) => {
                  const isSelected = selectedType === type;
                  return (
                    <motion.button
                      key={type}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedType(type)}
                      className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#4F6EF6]/10 border-[#4F6EF6]/45 shadow-[0_0_20px_rgba(79,110,246,0.1)]'
                          : 'bg-white/3 border-white/7 hover:border-white/18 hover:bg-white/5'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-[#4F6EF6] rounded-full flex items-center justify-center">
                          <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#4F6EF6]/18 border border-[#4F6EF6]/25' : 'bg-white/6 border border-white/8'}`}>
                        <Icon size={17} className={isSelected ? 'text-[#4F6EF6]' : 'text-white/45'} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold leading-none mb-0.5 ${isSelected ? 'text-[#4F6EF6]' : 'text-white/75'}`}>{label}</p>
                        <p className="text-white/30 text-[11px] leading-tight">{desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!canAdvanceStep0}
                className="w-full bg-[#4F6EF6] text-white font-black py-4 rounded-xl hover:bg-[#3D5CE4] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* Step 1 — Business Details */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-5 mb-7">
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-1.5">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. Safari Lounge, City Spa, Mama's Kitchen"
                    autoFocus
                    className="w-full bg-white/4 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 focus:bg-white/6 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-1.5">Your Name (Owner)</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. John Kamau"
                    className="w-full bg-white/4 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 focus:bg-white/6 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex items-center gap-1.5 px-5 py-4 rounded-xl bg-white/4 border border-white/8 text-white/50 hover:text-white hover:bg-white/8 transition-all font-bold text-sm">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!canAdvanceStep1}
                  className="flex-1 bg-[#4F6EF6] text-white font-black py-4 rounded-xl hover:bg-[#3D5CE4] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — PIN */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">
                {pinStage === 'create' ? 'Create Your Owner PIN' : 'Confirm Your PIN'}
              </p>
              <p className="text-white/25 text-xs mb-2">
                {pinStage === 'create'
                  ? 'This 4-digit PIN is how you log in to your POS dashboard.'
                  : 'Enter the same PIN again to confirm.'}
              </p>
              {pinError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1 mb-1 font-semibold">
                  {pinError}
                </motion.p>
              )}
              <PinDots value={pinStage === 'create' ? pin : pinConfirm} target={4} />
              <PinKeypad onPress={handlePinPress} onDelete={handlePinDelete} />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setStep(1); setPin(''); setPinConfirm(''); setPinStage('create'); setPinError(''); }}
                  className="flex items-center gap-1.5 px-5 py-4 rounded-xl bg-white/4 border border-white/8 text-white/50 hover:text-white hover:bg-white/8 transition-all font-bold text-sm"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handlePinNext}
                  disabled={pinStage === 'create' ? pin.length < 4 : pinConfirm.length < 4}
                  className="flex-1 bg-[#4F6EF6] text-white font-black py-4 rounded-xl hover:bg-[#3D5CE4] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {pinStage === 'create' ? 'Next' : 'Confirm PIN'} <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Done */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="w-20 h-20 bg-[#00FF88]/10 border-2 border-[#00FF88]/30 rounded-full flex items-center justify-center mx-auto mb-5"
              >
                <Check size={36} className="text-[#00FF88]" strokeWidth={2.5} />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2">You're all set!</h2>
              <p className="text-white/40 text-sm mb-1">{businessName}</p>
              <p className="text-white/25 text-xs mb-8">
                Your owner PIN is saved. You can add staff and update your inventory from the dashboard.
              </p>
              <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-8 text-left space-y-3">
                <Row label="Business" value={businessName} />
                <Row label="Owner" value={ownerName} />
                <Row label="Type" value={BUSINESS_TYPES.find(b => b.type === selectedType)?.label || selectedType || ''} />
                <Row label="Owner PIN" value="••••" />
              </div>
              <button
                onClick={handleLaunch}
                disabled={isSaving}
                className="w-full bg-[#4F6EF6] text-white font-black py-4 rounded-xl hover:bg-[#3D5CE4] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(79,110,246,0.3)]"
              >
                <Rocket size={18} />
                {isSaving ? 'Launching dashboard...' : 'Launch My Dashboard'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-white/15 text-xs mt-6">
          Signed in as <span className="text-white/30">{email}</span>
        </p>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 mx-auto mt-3 text-white/18 hover:text-white/40 text-xs transition-colors"
        >
          <LogOut size={12} /> Sign out
        </button>
      </motion.div>

      <p className="fixed bottom-6 text-white/15 text-xs z-10 font-bold uppercase tracking-widest">
        Powered by <span className="text-[#4F6EF6]/50">August</span>
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/30 text-xs">{label}</span>
      <span className="text-white text-xs font-semibold capitalize">{value}</span>
    </div>
  );
}
