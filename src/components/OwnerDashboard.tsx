import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { BusinessProfile } from '../types';
import {
  Users, TrendingUp, DollarSign, Activity, LogOut,
  RefreshCw, Search, ChevronDown, ChevronUp, BarChart2,
  CheckCircle, XCircle, Clock, Building2, Coffee,
  Dumbbell, Scissors, ShoppingBag, UtensilsCrossed,
  Wrench, Home, Pill, Wine, Shield, Zap, Calendar,
  AlertTriangle, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MADIS_ADMIN_EMAIL = 'jirush36@gmail.com';

export function isMadisAdmin(email: string | null | undefined): boolean {
  return email === MADIS_ADMIN_EMAIL;
}

const BUSINESS_ICONS: Record<string, any> = {
  bar: Wine, nightclub: Wine, restaurant: UtensilsCrossed, cafe: Coffee,
  spa: Scissors, gym: Dumbbell, shop: ShoppingBag, hardware: Wrench,
  rental: Home, hotel: Home, salon: Scissors, pharmacy: Pill,
};

const BUSINESS_COLORS: Record<string, string> = {
  bar: '#a855f7', nightclub: '#ec4899', restaurant: '#f97316', cafe: '#84cc16',
  spa: '#06b6d4', gym: '#00FF88', shop: '#f59e0b', hardware: '#64748b',
  rental: '#3b82f6', hotel: '#3b82f6', salon: '#ec4899', pharmacy: '#10b981',
};

const PLAN_PRICE_KES = 1000;

interface Subscriber extends BusinessProfile {
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
}

interface Stats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  expiringSoon: number;
  mrr: number;
  arr: number;
  byType: Record<string, number>;
  byMonth: { month: string; subscribers: number }[];
  recentSignups: Subscriber[];
}

function computeStats(subscribers: Subscriber[]): Stats {
  const now = Date.now();
  const active = subscribers.filter(s => s.subscriptionStatus === 'active').length;
  const expired = subscribers.filter(s => s.subscriptionStatus === 'expired').length;
  const pending = subscribers.filter(s => s.subscriptionStatus === 'pending').length;
  const expiringSoon = subscribers.filter(s => s.isExpiringSoon && s.subscriptionStatus === 'active').length;

  const byType: Record<string, number> = {};
  for (const s of subscribers) {
    if (s.businessType) byType[s.businessType] = (byType[s.businessType] || 0) + 1;
  }

  const monthMap: Record<string, number> = {};
  for (const s of subscribers) {
    if (s.createdAt) {
      const d = new Date(s.createdAt);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthMap[key] = (monthMap[key] || 0) + 1;
    }
  }
  const byMonth = Object.entries(monthMap)
    .sort((a, b) => {
      const parse = (k: string) => { const [m, y] = k.split(' '); return new Date(`${m} 20${y}`).getTime(); };
      return parse(a[0]) - parse(b[0]);
    })
    .slice(-8)
    .map(([month, subscribers]) => ({ month, subscribers }));

  const recentSignups = [...subscribers]
    .filter(s => s.createdAt)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  return {
    total: subscribers.length,
    active, expired, pending, expiringSoon,
    mrr: Math.round((active * PLAN_PRICE_KES) / 12),
    arr: active * PLAN_PRICE_KES,
    byType, byMonth, recentSignups,
  };
}

interface Props {
  email: string;
  onLogout: () => void;
}

export function OwnerDashboard({ email, onLogout }: Props) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all');
  const [sortField, setSortField] = useState<'createdAt' | 'businessName' | 'subscriptionExpiry'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'overview' | 'subscribers'>('overview');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchSubscribers = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const now = Date.now();
      const data: Subscriber[] = snap.docs.map(d => {
        const p = d.data() as BusinessProfile;
        const daysUntilExpiry = p.subscriptionExpiry
          ? Math.ceil((p.subscriptionExpiry - now) / (1000 * 60 * 60 * 24))
          : -999;
        return { ...p, daysUntilExpiry, isExpiringSoon: daysUntilExpiry >= 0 && daysUntilExpiry <= 30 };
      });
      setSubscribers(data);
    } catch (e) {
      console.error('Failed to load subscribers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const stats = computeStats(subscribers);

  const filtered = subscribers
    .filter(s => {
      const matchSearch = !search ||
        s.businessName?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.ownerName?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.subscriptionStatus === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const av = a[sortField] ?? 0;
      const bv = b[sortField] ?? 0;
      if (typeof av === 'string' && typeof bv === 'string')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const PIE_COLORS = ['#4F6EF6', '#00FF88', '#f97316', '#a855f7', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

  const pieData = Object.entries(stats.byType).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-[#07090F] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4F6EF6] rounded-lg flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          <div>
            <span className="font-black text-white text-sm tracking-tight">MADIS</span>
            <span className="ml-2 text-[10px] bg-[#4F6EF6]/20 text-[#4F6EF6] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Platform Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-xs hidden sm:block">{email}</span>
          <button
            onClick={() => fetchSubscribers(true)}
            disabled={refreshing}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white px-3 py-1.5 hover:bg-white/5 rounded-lg transition-all"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#4F6EF6]/20 border-t-[#4F6EF6] rounded-full animate-spin" />
          <p className="text-white/30 text-xs uppercase tracking-widest font-black">Loading platform data...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {/* Tab Bar */}
          <div className="flex gap-1 px-6 pt-5 pb-0 border-b border-white/8">
            {(['overview', 'subscribers'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-all capitalize ${
                  activeTab === tab
                    ? 'text-white bg-white/6 border border-b-0 border-white/10'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-6"
              >
                {/* KPI cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <KpiCard label="Total Subscribers" value={stats.total} icon={Users} color="#4F6EF6" />
                  <KpiCard label="Active" value={stats.active} icon={CheckCircle} color="#00FF88" />
                  <KpiCard label="Annual Revenue" value={`KSh ${stats.arr.toLocaleString()}`} icon={DollarSign} color="#f97316" />
                  <KpiCard label="Expiring (30d)" value={stats.expiringSoon} icon={AlertTriangle} color="#f59e0b" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <KpiCard label="Expired" value={stats.expired} icon={XCircle} color="#ef4444" />
                  <KpiCard label="Pending Payment" value={stats.pending} icon={Clock} color="#a855f7" />
                  <KpiCard label="Est. Monthly Rev." value={`KSh ${stats.mrr.toLocaleString()}`} icon={TrendingUp} color="#06b6d4" />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Signups over time */}
                  <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Signups Over Time</p>
                    {stats.byMonth.length === 0 ? (
                      <div className="h-40 flex items-center justify-center text-white/20 text-xs">No data yet</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={stats.byMonth} barCategoryGap="35%">
                          <XAxis dataKey="month" tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                          <Tooltip
                            contentStyle={{ background: '#111827', border: '1px solid #ffffff15', borderRadius: 10, fontSize: 12 }}
                            labelStyle={{ color: '#fff' }}
                            itemStyle={{ color: '#4F6EF6' }}
                          />
                          <Bar dataKey="subscribers" fill="#4F6EF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Business type breakdown */}
                  <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Business Types</p>
                    {pieData.length === 0 ? (
                      <div className="h-40 flex items-center justify-center text-white/20 text-xs">No data yet</div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <ResponsiveContainer width={130} height={130}>
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" strokeWidth={0}>
                              {pieData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          {pieData.map((entry, i) => {
                            const Icon = BUSINESS_ICONS[entry.name] || Building2;
                            return (
                              <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                <Icon size={11} className="text-white/40 shrink-0" />
                                <span className="text-white/60 text-xs capitalize truncate">{entry.name}</span>
                                <span className="ml-auto text-white font-bold text-xs">{entry.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent signups */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Recent Signups</p>
                  {stats.recentSignups.length === 0 ? (
                    <p className="text-white/20 text-xs text-center py-6">No subscribers yet</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.recentSignups.map(s => (
                        <SubscriberRow key={s.uid} s={s} compact />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'subscribers' && (
              <motion.div
                key="subscribers"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-4"
              >
                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search business, email, owner..."
                      className="w-full bg-white/4 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-[#4F6EF6]/50"
                    />
                  </div>
                  <div className="flex gap-1">
                    {(['all', 'active', 'expired', 'pending'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                          statusFilter === f
                            ? 'bg-[#4F6EF6] text-white'
                            : 'bg-white/4 text-white/40 hover:text-white hover:bg-white/8'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-white/25 text-xs">{filtered.length} subscriber{filtered.length !== 1 ? 's' : ''}</p>

                {/* Table header */}
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_1fr_120px_100px_80px] gap-4 px-4 py-3 border-b border-white/6 text-[10px] font-black uppercase tracking-widest text-white/30">
                    <SortHeader label="Business" field="businessName" current={sortField} dir={sortDir} onSort={handleSort} />
                    <span className="hidden sm:block">Owner / Email</span>
                    <SortHeader label="Joined" field="createdAt" current={sortField} dir={sortDir} onSort={handleSort} />
                    <SortHeader label="Expiry" field="subscriptionExpiry" current={sortField} dir={sortDir} onSort={handleSort} />
                    <span>Status</span>
                  </div>

                  {filtered.length === 0 ? (
                    <p className="text-center text-white/20 text-xs py-10">No subscribers match your filter</p>
                  ) : (
                    <div>
                      {filtered.map(s => (
                        <div key={s.uid}>
                          <button
                            onClick={() => setExpandedRow(expandedRow === s.uid ? null : s.uid)}
                            className="w-full grid grid-cols-[1fr_1fr_120px_100px_80px] gap-4 px-4 py-3.5 border-b border-white/4 hover:bg-white/3 transition-all text-left items-center"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {(() => { const Icon = BUSINESS_ICONS[s.businessType] || Building2; return <Icon size={13} className="text-white/30 shrink-0" />; })()}
                              <span className="text-xs text-white truncate font-semibold">{s.businessName || '—'}</span>
                            </div>
                            <div className="hidden sm:block min-w-0">
                              <p className="text-xs text-white/70 truncate">{s.ownerName || '—'}</p>
                              <p className="text-[10px] text-white/30 truncate">{s.email}</p>
                            </div>
                            <span className="text-xs text-white/40">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</span>
                            <span className={`text-xs ${s.isExpiringSoon ? 'text-amber-400' : 'text-white/40'}`}>
                              {s.subscriptionExpiry ? (s.daysUntilExpiry > 0 ? `${s.daysUntilExpiry}d` : 'Expired') : '—'}
                            </span>
                            <StatusBadge status={s.subscriptionStatus} />
                          </button>
                          <AnimatePresence>
                            {expandedRow === s.uid && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-b border-white/4 bg-white/2"
                              >
                                <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                  <InfoCell label="UID" value={s.uid} mono />
                                  <InfoCell label="Business Type" value={s.businessType || '—'} capitalize />
                                  <InfoCell label="Email" value={s.email} />
                                  <InfoCell label="Expiry Date" value={s.subscriptionExpiry ? new Date(s.subscriptionExpiry).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—'} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <footer className="border-t border-white/6 px-6 py-3 flex items-center justify-between text-[10px] text-white/15 shrink-0">
        <span>MADIS Platform Admin</span>
        <span className="font-bold text-white/25">Powered by <span className="text-[#4F6EF6]/60">August</span></span>
      </footer>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/3 border border-white/8 rounded-2xl p-5 flex items-start gap-4"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '20' }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">{label}</p>
        <p className="text-xl font-black text-white mt-0.5 leading-none">{value}</p>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    active:  { color: '#00FF88', bg: '#00FF8820' },
    expired: { color: '#ef4444', bg: '#ef444420' },
    pending: { color: '#a855f7', bg: '#a855f720' },
  };
  const s = map[status] || { color: '#ffffff40', bg: '#ffffff10' };
  return (
    <span className="text-[10px] font-bold px-2 py-1 rounded-full capitalize" style={{ color: s.color, background: s.bg }}>
      {status}
    </span>
  );
}

function SubscriberRow({ s, compact }: { s: Subscriber; compact?: boolean }) {
  const Icon = BUSINESS_ICONS[s.businessType] || Building2;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: (BUSINESS_COLORS[s.businessType] || '#4F6EF6') + '20' }}>
        <Icon size={13} style={{ color: BUSINESS_COLORS[s.businessType] || '#4F6EF6' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate">{s.businessName || s.email}</p>
        <p className="text-[10px] text-white/30 truncate">{s.ownerName} · {s.businessType}</p>
      </div>
      <div className="text-right shrink-0">
        <StatusBadge status={s.subscriptionStatus} />
        <p className="text-[10px] text-white/25 mt-1">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : ''}</p>
      </div>
    </div>
  );
}

function SortHeader({ label, field, current, dir, onSort }: { label: string; field: string; current: string; dir: 'asc' | 'desc'; onSort: (f: any) => void }) {
  const active = current === field;
  return (
    <button onClick={() => onSort(field)} className="flex items-center gap-1 hover:text-white/60 transition-colors">
      {label}
      {active ? (dir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null}
    </button>
  );
}

function InfoCell({ label, value, mono, capitalize }: { label: string; value: string; mono?: boolean; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-white/25 uppercase tracking-wider font-bold mb-0.5">{label}</p>
      <p className={`text-white/70 break-all ${mono ? 'font-mono text-[10px]' : ''} ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  );
}
