import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart2, Wine, Coffee, UtensilsCrossed, Scissors, Dumbbell,
  ShoppingBag, Wrench, Home, Pill, Moon, LogOut, Building2, Check
} from 'lucide-react';
import type { BusinessType } from '../types';

interface Props {
  email: string;
  onSave: (businessName: string, businessType: BusinessType, ownerName: string) => Promise<void>;
  onLogout: () => void;
}

const BUSINESS_TYPES: { type: BusinessType; icon: any; label: string; desc: string }[] = [
  { type: 'bar', icon: Wine, label: 'Bar', desc: 'Pub, bar or liquor outlet' },
  { type: 'nightclub', icon: Moon, label: 'Nightclub', desc: 'Club, lounge or venue' },
  { type: 'restaurant', icon: UtensilsCrossed, label: 'Restaurant', desc: 'Full-service dining' },
  { type: 'cafe', icon: Coffee, label: 'Café', desc: 'Coffee shop or café' },
  { type: 'spa', icon: Scissors, label: 'Spa & Salon', desc: 'Beauty, spa or salon' },
  { type: 'gym', icon: Dumbbell, label: 'Gym & Fitness', desc: 'Gym, yoga or fitness studio' },
  { type: 'shop', icon: ShoppingBag, label: 'Retail Shop', desc: 'General merchandise' },
  { type: 'hardware', icon: Wrench, label: 'Hardware Store', desc: 'Hardware & supplies' },
  { type: 'rental', icon: Home, label: 'Rental / Hotel', desc: 'Rooms, units or accommodation' },
  { type: 'hotel', icon: Building2, label: 'Hotel', desc: 'Hotel with multiple services' },
  { type: 'pharmacy', icon: Pill, label: 'Pharmacy', desc: 'Chemist or pharmacy' },
];

export function BusinessSelectPage({ email, onSave, onLogout }: Props) {
  const [selected, setSelected] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const canSave = selected && businessName.trim().length >= 2 && ownerName.trim().length >= 2;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onSave(businessName.trim(), selected!, ownerName.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-start p-4 pt-12 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#00FF88] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.3)] mb-3">
            <BarChart2 size={24} className="text-black" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Set Up Your Business</h1>
          <p className="text-white/40 text-sm mt-1">Tell us about your business to personalise MADIS for you.</p>
        </div>

        {/* Business Name */}
        <div className="mb-5">
          <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1.5">Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="e.g. Safari Lounge, City Spa, Mama's Kitchen"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 focus:bg-white/8 transition-all text-sm"
          />
        </div>

        {/* Owner Name */}
        <div className="mb-6">
          <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1.5">Your Name (Owner)</label>
          <input
            type="text"
            value={ownerName}
            onChange={e => setOwnerName(e.target.value)}
            placeholder="e.g. John Kamau"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 focus:bg-white/8 transition-all text-sm"
          />
        </div>

        {/* Business Type */}
        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Type of Business</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {BUSINESS_TYPES.map(({ type, icon: Icon, label, desc }, i) => {
            const isSelected = selected === type;
            return (
              <motion.button
                key={type}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(type)}
                className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#00FF88]/10 border-[#00FF88]/50 shadow-[0_0_20px_rgba(0,255,136,0.1)]'
                    : 'bg-white/3 border-white/8 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-[#00FF88] rounded-full flex items-center justify-center">
                    <Check size={11} className="text-black" strokeWidth={3} />
                  </div>
                )}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-[#00FF88]/20' : 'bg-white/8'
                }`}>
                  <Icon size={18} className={isSelected ? 'text-[#00FF88]' : 'text-white/50'} />
                </div>
                <div>
                  <p className={`text-sm font-bold leading-none mb-0.5 ${isSelected ? 'text-[#00FF88]' : 'text-white/80'}`}>{label}</p>
                  <p className="text-white/35 text-[11px] leading-tight">{desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="w-full bg-[#00FF88] text-black font-black py-4 rounded-xl hover:bg-[#00e87a] transition-all disabled:opacity-30 disabled:cursor-not-allowed text-base shadow-[0_0_20px_rgba(0,255,136,0.2)]"
        >
          {isSaving ? 'Setting up...' : 'Launch My Dashboard'}
        </button>

        <p className="text-center text-white/25 text-xs mt-4">
          Signed in as <span className="text-white/40">{email}</span>
        </p>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 mx-auto mt-4 text-white/25 hover:text-white/50 text-xs transition-colors"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </motion.div>

      <p className="fixed bottom-6 text-white/20 text-xs">
        Built by <span className="text-white/40 font-bold">August</span>
      </p>
    </div>
  );
}
