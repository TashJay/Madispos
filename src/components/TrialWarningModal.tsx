import { motion } from 'motion/react';
import { Clock, Crown, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  daysLeft: number;
  onSubscribe: () => void;
  onDismiss: () => void;
}

const included = [
  'All your existing data stays safe',
  'Unlimited staff & inventory',
  'M-Pesa & cash payment recording',
  'Business AI & reports',
];

export function TrialWarningModal({ daysLeft, onSubscribe, onDismiss }: Props) {
  const isExpiring = daysLeft === 0;
  const isUrgent = daysLeft <= 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="w-full max-w-md bg-[#0C1220] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Top accent bar */}
        <div className={`h-1.5 w-full ${isUrgent ? 'bg-red-500' : 'bg-amber-500'}`} />

        <div className="p-8">
          {/* Icon + close */}
          <div className="flex items-start justify-between mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              isUrgent
                ? 'bg-red-500/15 border border-red-500/25'
                : 'bg-amber-500/15 border border-amber-500/25'
            }`}>
              {isExpiring
                ? <AlertTriangle size={26} className="text-red-400" />
                : <Clock size={26} className={isUrgent ? 'text-red-400' : 'text-amber-400'} />
              }
            </div>
            <button
              onClick={onDismiss}
              className="p-2 text-white/20 hover:text-white/60 transition-colors rounded-xl"
            >
              <X size={18} />
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
              {isExpiring
                ? 'Your trial expires today'
                : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your trial`}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              {isExpiring
                ? 'Subscribe now to keep all your data and continue using MADIS without interruption.'
                : `Your 14-day free trial ends soon. Subscribe before it expires — your data is always kept safe.`}
            </p>
          </div>

          {/* What's included */}
          <div className="bg-white/3 border border-white/7 rounded-2xl p-4 mb-6">
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-3">Subscribing keeps</p>
            <ul className="space-y-2">
              {included.map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/65">
                  <CheckCircle2 size={13} className="text-[#4F6EF6] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <div className="inline-flex items-end gap-1 mb-1">
              <span className="text-4xl font-black text-white">KSh 1,000</span>
              <span className="text-white/40 text-sm mb-1">/year</span>
            </div>
            <p className="text-white/25 text-xs">≈ $1 USD &nbsp;·&nbsp; Less than KSh 3 per day</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onSubscribe}
              className="w-full py-4 bg-[#4F6EF6] text-white font-black rounded-xl hover:bg-[#3D5CE4] transition-all hover:scale-[1.02] shadow-[0_8px_20px_rgba(79,110,246,0.3)] flex items-center justify-center gap-2 text-sm"
            >
              <Crown size={15} />
              Subscribe Now — KSh 1,000/yr
            </button>
            <button
              onClick={onDismiss}
              className="w-full py-3 text-white/25 hover:text-white/50 text-sm transition-colors font-medium"
            >
              {isExpiring ? 'Remind me later' : 'Continue with trial'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
