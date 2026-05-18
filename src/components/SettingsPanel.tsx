import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Save, Printer, Palette, Building2, FileText,
  CheckCircle2, Settings, ToggleLeft, ToggleRight,
  Globe, Timer, ShieldCheck
} from 'lucide-react';

export interface POSSettings {
  autoPrint: boolean;
  receiptTagline: string;
  language: 'en' | 'sw';
  autoLockMinutes: number;
}

export const DEFAULT_SETTINGS: POSSettings = {
  autoPrint: false,
  receiptTagline: '',
  language: 'en',
  autoLockMinutes: 30,
};

export const LANGUAGES: { value: 'en' | 'sw'; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'sw', label: 'Swahili', native: 'Kiswahili' },
];

export const AUTO_LOCK_OPTIONS: { value: number; label: string }[] = [
  { value: 0,   label: 'Never' },
  { value: 5,   label: '5 minutes' },
  { value: 15,  label: '15 minutes' },
  { value: 30,  label: '30 minutes' },
  { value: 60,  label: '1 hour' },
  { value: 120, label: '2 hours' },
];

interface Props {
  settings: POSSettings;
  businessName: string;
  ownerName: string;
  onSave: (s: POSSettings) => void;
}

export const SettingsPanel: React.FC<Props> = ({ settings, businessName, ownerName, onSave }) => {
  const [draft, setDraft] = useState<POSSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const Toggle = ({ value, onChange, label, description }: {
    value: boolean; onChange: (v: boolean) => void;
    label: string; description: string;
  }) => (
    <div className="flex items-start justify-between gap-4 p-5 themed-bg-primary rounded-2xl border themed-border">
      <div className="flex-1">
        <p className="text-sm font-bold themed-text">{label}</p>
        <p className="text-xs themed-text-dim mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`shrink-0 mt-0.5 transition-colors ${value ? 'text-[#4F6EF6]' : 'themed-text-dim'}`}
      >
        {value ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
      </button>
    </div>
  );

  return (
    <div className="space-y-8 pb-16 max-w-2xl">
      <header>
        <h2 className="text-2xl font-black themed-text tracking-tighter flex items-center gap-3">
          <Settings size={22} className="text-[#4F6EF6]" />
          Business Settings
        </h2>
        <p className="themed-text-dim text-sm mt-1">Configure your POS preferences. Settings are saved locally and sync when online.</p>
      </header>

      {/* Business Profile */}
      <section className="luxury-card p-6 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest themed-text-dim flex items-center gap-2">
          <Building2 size={13} />
          Business Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 themed-bg-primary rounded-xl border themed-border">
            <p className="text-[10px] themed-text-dim uppercase tracking-widest mb-1">Business Name</p>
            <p className="font-bold themed-text text-sm">{businessName}</p>
          </div>
          <div className="p-4 themed-bg-primary rounded-xl border themed-border">
            <p className="text-[10px] themed-text-dim uppercase tracking-widest mb-1">Owner</p>
            <p className="font-bold themed-text text-sm">{ownerName}</p>
          </div>
        </div>
        <p className="text-[10px] themed-text-dim">
          To change your business name or type, contact support or create a new account.
        </p>
      </section>

      {/* Language & Region */}
      <section className="luxury-card p-6 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest themed-text-dim flex items-center gap-2">
          <Globe size={13} />
          Language &amp; Region
        </h3>
        <div>
          <label className="text-[10px] themed-text-dim uppercase tracking-widest font-bold block mb-2">
            Display Language
          </label>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map(lang => (
              <button
                key={lang.value}
                onClick={() => setDraft(d => ({ ...d, language: lang.value }))}
                className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-all text-left ${
                  draft.language === lang.value
                    ? 'bg-[#4F6EF6]/10 border-[#4F6EF6]/40 text-[#4F6EF6]'
                    : 'themed-bg-primary themed-border themed-text-dim hover:themed-text'
                }`}
              >
                <span className="font-black text-sm">{lang.native}</span>
                <span className="text-[10px] opacity-60">{lang.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] themed-text-dim mt-2">
            Sets the language for receipts and key interface elements.
          </p>
        </div>
      </section>

      {/* Security & Access */}
      <section className="luxury-card p-6 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest themed-text-dim flex items-center gap-2">
          <ShieldCheck size={13} />
          Security &amp; Access
        </h3>
        <div>
          <label className="text-[10px] themed-text-dim uppercase tracking-widest font-bold block mb-2">
            Auto-Lock Timer
          </label>
          <div className="grid grid-cols-3 gap-2">
            {AUTO_LOCK_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDraft(d => ({ ...d, autoLockMinutes: opt.value }))}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  draft.autoLockMinutes === opt.value
                    ? 'bg-[#4F6EF6]/10 border-[#4F6EF6]/40 text-[#4F6EF6]'
                    : 'themed-bg-primary themed-border themed-text-dim hover:themed-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] themed-text-dim mt-2">
            Automatically locks the terminal and returns to the PIN screen after this period of inactivity. Set to Never for shared devices where staff manage their own sessions.
          </p>
        </div>

        <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl">
          <div className="flex gap-3 items-start">
            <Timer size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400/80 leading-relaxed">
              <strong>Tip:</strong> Set a short lock time (5–15 min) if your terminal is in a public-facing area where customers could access it unsupervised.
            </p>
          </div>
        </div>
      </section>

      {/* Receipt Settings */}
      <section className="luxury-card p-6 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest themed-text-dim flex items-center gap-2">
          <FileText size={13} />
          Receipt Settings
        </h3>

        <Toggle
          value={draft.autoPrint}
          onChange={v => setDraft(d => ({ ...d, autoPrint: v }))}
          label="Auto-Print Receipts"
          description="When enabled, a print dialog opens automatically after every completed sale."
        />

        <div>
          <label className="text-[10px] themed-text-dim uppercase tracking-widest font-bold block mb-1.5">
            Receipt Tagline
          </label>
          <input
            type="text"
            value={draft.receiptTagline}
            onChange={e => setDraft(d => ({ ...d, receiptTagline: e.target.value }))}
            placeholder={`e.g. "Premium ${businessName} Terminal" or "Nairobi, Kenya"`}
            maxLength={60}
            className="w-full bg-white/4 border border-white/8 rounded-xl py-3 px-4 themed-text placeholder-white/18 focus:outline-none focus:border-[#4F6EF6]/50 transition-all text-sm"
          />
          <p className="text-[10px] themed-text-dim mt-1.5">
            This line appears below your business name on every receipt. Leave blank to hide.
          </p>
        </div>

        {/* Receipt preview */}
        <div className="p-4 bg-white/3 border border-white/6 rounded-xl">
          <p className="text-[9px] themed-text-dim uppercase tracking-widest mb-3">Receipt Preview</p>
          <div className="font-mono text-center text-xs space-y-0.5 themed-text">
            <p className="font-black text-base">{businessName.toUpperCase()}</p>
            {draft.receiptTagline && (
              <p className="text-[10px] tracking-widest opacity-60">{draft.receiptTagline.toUpperCase()}</p>
            )}
            <p className="border-t border-dashed border-white/20 mt-2 pt-2 text-[10px] opacity-40">
              ···· receipt details ····
            </p>
          </div>
        </div>
      </section>

      {/* Printer tip */}
      <section className="luxury-card p-5 border-[#4F6EF6]/15 bg-[#4F6EF6]/3">
        <div className="flex gap-4">
          <Printer size={18} className="text-[#4F6EF6] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold themed-text mb-1">Thermal Printer Tip</p>
            <p className="text-xs themed-text-dim leading-relaxed">
              MADIS receipts are formatted for 80mm thermal printers. In your browser print dialog, set the paper size to 80mm, margins to None, and disable headers/footers for clean receipts.
            </p>
          </div>
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!isDirty && !saved}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${
            saved
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : isDirty
              ? 'bg-[#4F6EF6] text-white hover:bg-[#3D5CE4] shadow-[0_0_20px_rgba(79,110,246,0.25)]'
              : 'bg-white/5 text-white/25 cursor-not-allowed border border-white/8'
          }`}
        >
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          {saved ? 'Settings Saved' : 'Save Settings'}
        </button>
        {isDirty && !saved && (
          <button
            onClick={() => setDraft(settings)}
            className="text-xs themed-text-dim hover:themed-text transition-colors"
          >
            Discard changes
          </button>
        )}
      </div>
    </div>
  );
};
