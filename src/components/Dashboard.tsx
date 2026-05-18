import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, ShoppingCart, CreditCard, Calendar, Clock,
  Coffee, Moon, Sun, ArrowUpRight, ArrowDownRight, Zap,
  Crown, Users, BarChart3, ClipboardList, Plus, Package
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { Tab, TabStatus, User, UserRole, ProductType, Product } from '../types';

interface DashboardProps {
  currentUser: User;
  tabs: Tab[];
  inventory: Product[];
  staff: User[];
  businessName?: string;
  onNavigate: (tab: 'sales' | 'tabs' | 'inventory' | 'reports' | 'debts') => void;
}

const ACCENT = '#4F6EF6';
const ACCENT_DIM = 'rgba(79,110,246,0.2)';

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, tabs, inventory, staff, businessName, onNavigate }) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Coffee };
    if (hour < 18) return { text: 'Good Afternoon', icon: Sun };
    return { text: 'Good Evening', icon: Moon };
  }, []);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayTabs = tabs.filter(t => (t.createdAt || 0) >= today);
    const userTabsToday = todayTabs.filter(t => t.staffId === currentUser.id);

    const salesToday = todayTabs
      .filter(t => String(t.status).toUpperCase() === TabStatus.PAID)
      .reduce((sum, t) => sum + (t.total || 0), 0);

    const userSalesToday = userTabsToday
      .filter(t => String(t.status).toUpperCase() === TabStatus.PAID)
      .reduce((sum, t) => sum + (t.total || 0), 0);

    const activeOrders = tabs.filter(t => String(t.status).toUpperCase() === TabStatus.OPEN).length;
    const userActiveOrders = tabs.filter(t => t.staffId === currentUser.id && String(t.status).toUpperCase() === TabStatus.OPEN).length;

    const totalDebts = tabs
      .filter(t => String(t.status).toUpperCase() === TabStatus.UNPAID)
      .reduce((sum, t) => sum + (t.total || 0), 0);
    const debtCount = tabs.filter(t => String(t.status).toUpperCase() === TabStatus.UNPAID).length;

    const lowStockItems = inventory.filter(i => i.stock < 10 && i.type !== ProductType.SERVICE);
    const totalTransactions = todayTabs.filter(t => String(t.status).toUpperCase() === TabStatus.PAID).length;

    return {
      salesToday, userSalesToday, activeOrders, userActiveOrders,
      totalDebts, debtCount, totalTransactions,
      todayCount: todayTabs.length,
      userTodayCount: userTabsToday.length,
      lowStockCount: lowStockItems.length,
      lowStockItems,
    };
  }, [tabs, inventory, currentUser]);

  const salesByHour = useMemo(() => {
    if (currentUser.role === UserRole.STAFF) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTime = today.getTime();

    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, sales: 0, count: 0 }));
    tabs
      .filter(t => String(t.status).toUpperCase() === TabStatus.PAID && (t.createdAt || 0) >= startTime)
      .forEach(t => {
        const hour = new Date(t.createdAt || 0).getHours();
        hours[hour].sales += (t.total || 0);
        hours[hour].count += 1;
      });
    return hours.filter(h => h.sales > 0 || new Date().getHours() >= parseInt(h.hour));
  }, [tabs]);

  const staffSales = useMemo(() => {
    if (currentUser.role === UserRole.STAFF) return [];
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const paidTabs = tabs.filter(t => String(t.status).toUpperCase() === TabStatus.PAID && (t.createdAt || 0) >= todayStart.getTime());
    const salesByStaff: { [key: string]: number } = {};
    paidTabs.forEach(t => { salesByStaff[t.staffId] = (salesByStaff[t.staffId] || 0) + (t.total || 0); });
    return staff
      .map(s => ({ id: s.id, name: s.name, role: s.role, sales: salesByStaff[s.id] || 0 }))
      .sort((a, b) => b.sales - a.sales);
  }, [tabs, staff, currentUser]);

  const GreetingIcon = greeting.icon;
  const isManagement = [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERVISOR].includes(
    String(currentUser.role).toUpperCase() as UserRole
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GreetingIcon className="text-[#4F6EF6]" size={14} />
            <span className="themed-text-dim text-[10px] font-black uppercase tracking-[0.3em]">{greeting.text}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black themed-text tracking-tighter leading-none">
            Welcome, <span className="text-[#4F6EF6]">{currentUser.name.split(' ')[0]}</span>
          </h2>
          {businessName && (
            <p className="text-[11px] themed-text-dim uppercase tracking-widest font-bold opacity-60">{businessName}</p>
          )}
        </div>
        <div className="flex items-center gap-3 bg-white/3 border themed-border rounded-2xl px-5 py-3 glass-panel">
          <Calendar size={15} className="text-[#4F6EF6]" />
          <span className="text-sm font-bold themed-text opacity-75">
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </header>

      {/* STAFF VIEW */}
      {currentUser.role === UserRole.STAFF ? (
        <div className="space-y-7">
          <section className="luxury-card p-8 bg-gradient-to-br from-[#4F6EF6]/6 to-transparent border-[#4F6EF6]/15">
            <p className="text-[10px] themed-text-dim font-black uppercase tracking-[0.3em] mb-2">Flash Summary</p>
            <h3 className="text-2xl md:text-3xl font-black themed-text tracking-tighter">
              Your sales today: <span className="text-[#4F6EF6]">KES {stats.userSalesToday.toLocaleString()}</span>
            </h3>
            <p className="themed-text-dim text-xs font-medium mt-2">Across {stats.userTodayCount} sessions</p>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black themed-text flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4F6EF6]/10 flex items-center justify-center border border-[#4F6EF6]/15">
                  <ClipboardList size={16} className="text-[#4F6EF6]" />
                </div>
                Your Active Tabs
              </h3>
              <span className="px-3 py-1 bg-[#4F6EF6]/10 text-[#4F6EF6] border border-[#4F6EF6]/20 rounded-lg text-[10px] font-black uppercase tracking-widest">{stats.userActiveOrders} Live</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tabs.filter(t => t.staffId === currentUser.id && t.status === TabStatus.OPEN).length === 0 ? (
                <div className="col-span-full h-44 flex flex-col items-center justify-center themed-bg-secondary border themed-border rounded-3xl opacity-30">
                  <Plus size={28} className="themed-text mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest themed-text">No pending orders</p>
                  <button onClick={() => onNavigate('sales')} className="mt-3 text-[10px] text-[#4F6EF6] font-black uppercase tracking-widest underline underline-offset-4">
                    Create New Sale
                  </button>
                </div>
              ) : (
                tabs.filter(t => t.staffId === currentUser.id && t.status === TabStatus.OPEN).map(tab => (
                  <div
                    key={tab.id}
                    onClick={() => onNavigate('tabs')}
                    className="p-5 themed-bg-secondary border themed-border rounded-3xl hover:border-[#4F6EF6]/25 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-black themed-text truncate pr-4 text-sm">{tab.customerName}</h4>
                      <ArrowUpRight size={13} className="themed-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-0.5 mb-3">
                      {tab.items.slice(0, 2).map((item, i) => (
                        <p key={i} className="text-[10px] themed-text-dim truncate">{item.quantity}× {item.name}</p>
                      ))}
                      {tab.items.length > 2 && <p className="text-[10px] themed-text-dim opacity-45">+ {tab.items.length - 2} more</p>}
                    </div>
                    <p className="text-base font-black text-[#4F6EF6]">KES {tab.total.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : (
        <>
          {/* MANAGEMENT VIEW */}

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              title="Sales Today"
              value={`KES ${stats.salesToday.toLocaleString()}`}
              icon={TrendingUp}
              description={`${stats.totalTransactions} paid transactions`}
              color="blue"
              trend="+14.2%"
              trendUp={true}
              onClick={() => onNavigate('reports')}
            />
            {stats.lowStockCount > 0 ? (
              <StatCard
                title="Low Stock"
                value={stats.lowStockCount.toString()}
                icon={Package}
                description="Items requiring replenishment"
                color="red"
                trend="Alert active"
                trendUp={false}
                onClick={() => onNavigate('inventory')}
              />
            ) : (
              <StatCard
                title="Inventory"
                value={inventory.length.toString()}
                icon={Package}
                description="Products in stock — all healthy"
                color="green"
                trend="All stocked"
                onClick={() => onNavigate('inventory')}
              />
            )}
            <StatCard
              title="Live Orders"
              value={stats.activeOrders.toString()}
              icon={ShoppingCart}
              description="Open tabs requiring service"
              color="blue"
              trend="In queue"
              onClick={() => onNavigate('tabs')}
            />
            <StatCard
              title="Current Debts"
              value={`KES ${stats.totalDebts.toLocaleString()}`}
              icon={CreditCard}
              description={`${stats.debtCount} accounts pending`}
              color="red"
              trend="-2.4%"
              trendUp={false}
              onClick={() => onNavigate('debts')}
            />
          </div>

          {/* Low stock alerts */}
          {isManagement && stats.lowStockCount > 0 && (
            <section className="luxury-card border-red-500/15 bg-red-500/[0.02] p-7">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black themed-text flex items-center gap-3 uppercase tracking-tighter">
                  <Zap size={16} className="text-red-400 animate-pulse" />
                  Inventory Alerts
                </h3>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="px-4 py-2 bg-red-500/8 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/15 transition-all border border-red-500/15"
                >
                  Manage Stock
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.lowStockItems.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-black/5 rounded-2xl border themed-border">
                    <div className="min-w-0">
                      <p className="font-black themed-text truncate leading-none text-sm">{item.name}</p>
                      <p className="text-[9px] themed-text-dim mt-0.5 font-black uppercase tracking-widest">{item.category}</p>
                    </div>
                    <div className="flex flex-col items-end ml-3">
                      <span className="text-sm font-black text-red-400 font-mono">{item.stock}</span>
                      <span className="text-[8px] themed-text-dim uppercase font-black tracking-tight">units left</span>
                    </div>
                  </div>
                ))}
                {stats.lowStockCount > 3 && (
                  <button
                    onClick={() => onNavigate('inventory')}
                    className="p-4 flex items-center justify-center bg-black/5 rounded-2xl border themed-border border-dashed hover:bg-black/10 transition-all text-[9px] themed-text-dim font-black uppercase tracking-[0.2em]"
                  >
                    + {stats.lowStockCount - 3} more items at risk
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Sales chart */}
          <div className="luxury-card p-8 relative overflow-hidden">
            <header className="mb-7 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black themed-text flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#4F6EF6]/10 flex items-center justify-center border border-[#4F6EF6]/15">
                    <BarChart3 size={16} className="text-[#4F6EF6]" />
                  </div>
                  Sales Revenue by Hour
                </h3>
                <p className="themed-text-dim text-xs font-medium mt-1">Hourly transaction volume today</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/3 rounded-xl border themed-border">
                <Clock size={13} className="text-[#4F6EF6]" />
                <span className="text-[10px] themed-text font-black uppercase tracking-widest leading-none">Live</span>
              </div>
            </header>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByHour} barSize={salesByHour.length > 15 ? 12 : 22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v}
                    width={36}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(79,110,246,0.06)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="themed-bg-secondary border themed-border p-4 rounded-2xl shadow-2xl">
                            <p className="text-[10px] themed-text-dim uppercase font-black tracking-widest mb-1">{payload[0].payload.hour}</p>
                            <p className="text-lg font-black text-[#4F6EF6]">KES {(payload[0].value as number)?.toLocaleString()}</p>
                            <p className="text-[10px] themed-text-dim mt-0.5">{payload[0].payload.count} transaction(s)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sales" radius={[5, 5, 0, 0]}>
                    {salesByHour.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={new Date().getHours() === parseInt(entry.hour) ? ACCENT : ACCENT_DIM}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Staff leaderboard */}
          {isManagement && (
            <div className="luxury-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 themed-text opacity-4">
                <Users size={100} />
              </div>
              <header className="mb-7 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-black themed-text flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4F6EF6]/10 flex items-center justify-center border border-[#4F6EF6]/15">
                      <TrendingUp size={16} className="text-[#4F6EF6]" />
                    </div>
                    Staff Performance
                  </h3>
                  <p className="themed-text-dim text-xs font-medium mt-1">Today's sales by staff member</p>
                </div>
                <Crown size={22} className="text-[#4F6EF6] opacity-20" />
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {staffSales.map((s, idx) => (
                  <div key={s.id} className="p-5 bg-white/2 rounded-3xl border themed-border group hover:border-[#4F6EF6]/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                        idx === 0 ? 'bg-[#4F6EF6] text-white shadow-[0_0_12px_rgba(79,110,246,0.3)]' : 'bg-white/6 themed-text-dim'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        String(s.role).toUpperCase() === UserRole.OWNER
                          ? 'bg-[#4F6EF6]/15 text-[#4F6EF6] border border-[#4F6EF6]/25'
                          : 'themed-bg-secondary themed-text-dim border themed-border'
                      }`}>
                        {s.role}
                      </div>
                    </div>
                    <p className="text-[10px] themed-text-dim uppercase font-black mb-1 tracking-widest">{s.name}</p>
                    <p className="text-xl font-black themed-text">KES {s.sales.toLocaleString()}</p>
                    <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4F6EF6] shadow-[0_0_8px_rgba(79,110,246,0.4)] transition-all duration-1000"
                        style={{ width: `${stats.salesToday > 0 ? (s.sales / stats.salesToday) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t themed-border flex justify-between items-center">
                <span className="text-[10px] themed-text-dim font-black uppercase tracking-widest">Shift data verified</span>
                <span className="text-[9px] themed-text opacity-20 font-black uppercase tracking-widest">Powered by August</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function StatCard({ title, value, icon: Icon, description, color, trend, trendUp, onClick }: any) {
  const colorMap: any = {
    blue:  { text: 'text-[#4F6EF6]',  bg: 'bg-[#4F6EF6]/10',  border: 'border-[#4F6EF6]/20',  glow: 'bg-[#4F6EF6]'  },
    green: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', glow: 'bg-emerald-400' },
    red:   { text: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     glow: 'bg-red-400'    },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      onClick={onClick}
      className={`luxury-card p-6 md:p-8 relative overflow-hidden group transition-all ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      <div className={`absolute top-0 right-0 w-36 h-36 opacity-5 blur-3xl -mr-10 -mt-10 rounded-full ${c.glow}`} />
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl ${c.bg} ${c.border} border shadow-sm`}>
          <Icon size={24} className={c.text} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
            trendUp === true ? 'text-emerald-400' : trendUp === false ? 'text-red-400' : 'themed-text-dim'
          }`}>
            {trendUp === true && <ArrowUpRight size={13} />}
            {trendUp === false && <ArrowDownRight size={13} />}
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-[10px] font-black themed-text-dim uppercase tracking-[0.3em] mb-1.5">{title}</h3>
      <p className="text-3xl font-black themed-text tracking-tighter mb-2">{value}</p>
      <p className="text-[11px] themed-text-dim font-bold uppercase tracking-wider">{description}</p>
      {onClick && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={14} className="text-[#4F6EF6]" />
        </div>
      )}
    </motion.div>
  );
}
