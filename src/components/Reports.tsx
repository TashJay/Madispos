import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Trash2,
  Edit3,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Tab, TabStatus, Product, InventoryItem } from '../types';

interface ReportsProps {
  tabs: Tab[];
  inventory: InventoryItem[];
  staff: any[];
  onDeleteTab?: (tabId: string, name: string) => void;
  onEditTab?: (tabId: string, customerName: string) => Promise<void>;
}

const COLORS = ['#4F6EF6', '#D4AF37', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B'];

export const Reports: React.FC<ReportsProps> = ({ tabs, inventory, staff, onDeleteTab, onEditTab }) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showSalesLog, setShowSalesLog] = useState(false);
  const [salesPage, setSalesPage] = useState(0);
  const PAGE_SIZE = 15;

  const stats = useMemo(() => {
    const paidTabs = tabs.filter(t => t.status === TabStatus.PAID);
    const totalRevenue = paidTabs.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = paidTabs.length;
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const unpaidRevenue = tabs.filter(t => t.status === TabStatus.UNPAID).reduce((sum, t) => sum + t.total, 0);

    const categorySales: Record<string, number> = {};
    paidTabs.forEach(t => {
      t.items.forEach(item => {
        const invItem = inventory.find(i => i.id === item.productId);
        const cat = invItem?.category || 'Other';
        categorySales[cat] = (categorySales[cat] || 0) + (item.priceAtSale * item.quantity);
      });
    });

    const categoryData = Object.entries(categorySales).map(([name, value]) => ({ name, value }));

    const staffPerf = staff.map(s => {
      const staffSales = paidTabs.filter(t => t.staffId === s.id).reduce((sum, t) => sum + t.total, 0);
      return { name: s.name, sales: staffSales };
    }).filter(s => s.sales > 0).sort((a, b) => b.sales - a.sales);

    return {
      totalRevenue,
      totalTransactions,
      avgOrderValue,
      unpaidRevenue,
      categoryData,
      staffPerf,
    };
  }, [tabs, inventory, staff]);

  const paidTabs = useMemo(() =>
    [...tabs.filter(t => t.status === TabStatus.PAID)].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)),
    [tabs]
  );

  const pagedSales = paidTabs.slice(salesPage * PAGE_SIZE, (salesPage + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(paidTabs.length / PAGE_SIZE);

  const startEdit = (tab: Tab) => {
    setEditingTabId(tab.id);
    setEditName(tab.customerName || '');
  };

  const confirmEdit = async () => {
    if (!editingTabId || !onEditTab) return;
    await onEditTab(editingTabId, editName);
    setEditingTabId(null);
    setEditName('');
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-black themed-text tracking-tighter">Reports & Intelligence</h2>
        <p className="themed-text-dim text-sm font-medium mt-1">Financial analytics, staff insights, and sales history</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Gross Revenue"
          value={`KES ${stats.totalRevenue.toLocaleString()}`}
          trend="+12.5%"
          positive
          icon={TrendingUp}
        />
        <StatCard
          label="Avg. Transaction"
          value={`KES ${Math.round(stats.avgOrderValue).toLocaleString()}`}
          trend="+3.2%"
          positive
          icon={DollarSign}
        />
        <StatCard
          label="Unpaid Ledger"
          value={`KES ${stats.unpaidRevenue.toLocaleString()}`}
          trend="Risk"
          positive={false}
          icon={Clock}
        />
        <StatCard
          label="Volume"
          value={stats.totalTransactions.toString()}
          trend="Live"
          positive
          icon={BarChartIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="luxury-card p-8 themed-bg-secondary border themed-border">
          <h3 className="text-xl font-black themed-text mb-8 flex items-center gap-3">
            <PieChartIcon size={20} className="text-[#4F6EF6]" />
            Revenue by Category
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '1rem' }}
                  itemStyle={{ color: 'var(--chart-tooltip-text)' }}
                  labelStyle={{ color: 'var(--chart-tooltip-dim)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {stats.categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] themed-text-dim uppercase font-black tracking-widest">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="luxury-card p-8 themed-bg-secondary border themed-border">
          <h3 className="text-xl font-black themed-text mb-8 flex items-center gap-3">
            <Users size={20} className="text-[#4F6EF6]" />
            Staff Performance
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.staffPerf} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--chart-text)', fontSize: 10, fontWeight: 900 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: 'var(--chart-grid)' }}
                  contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '1rem' }}
                  itemStyle={{ color: 'var(--chart-tooltip-text)' }}
                />
                <Bar dataKey="sales" fill="#4F6EF6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="luxury-card p-8 themed-bg-secondary border themed-border">
        <h3 className="text-xl font-black themed-text mb-8 flex items-center gap-3">
          <Package size={20} className="text-[#4F6EF6]" />
          Stock Health Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-black/5 rounded-2xl border themed-border">
            <p className="text-[9px] themed-text-dim font-black uppercase tracking-widest mb-1">Low Stock Warning</p>
            <p className="text-2xl font-black text-red-500">{inventory.filter(i => (i as any).stock < 10).length}</p>
          </div>
          <div className="p-4 bg-black/5 rounded-2xl border themed-border">
            <p className="text-[9px] themed-text-dim font-black uppercase tracking-widest mb-1">Total SKU Count</p>
            <p className="text-2xl font-black themed-text">{inventory.length}</p>
          </div>
          <div className="p-4 bg-black/5 rounded-2xl border themed-border">
            <p className="text-[9px] themed-text-dim font-black uppercase tracking-widest mb-1">Total Unit Value</p>
            <p className="text-2xl font-black themed-text">~{Math.round(inventory.reduce((sum, i) => sum + (i.price * ((i as any).stock || 0)), 0) / 1000)}K</p>
          </div>
          <div className="p-4 bg-black/5 rounded-2xl border themed-border">
            <p className="text-[9px] themed-text-dim font-black uppercase tracking-widest mb-1">Replenishments</p>
            <p className="text-2xl font-black themed-text">0</p>
          </div>
        </div>
      </div>

      {/* Sales Log */}
      <div className="luxury-card themed-bg-secondary border themed-border overflow-hidden">
        <button
          onClick={() => setShowSalesLog(s => !s)}
          className="w-full flex items-center justify-between p-8 text-left hover:bg-black/5 transition-colors"
        >
          <div>
            <h3 className="text-xl font-black themed-text flex items-center gap-3">
              <TrendingUp size={20} className="text-[#4F6EF6]" />
              Sales Log
              <span className="text-[10px] themed-text-dim bg-black/10 border themed-border px-3 py-1 rounded-full font-black uppercase tracking-widest">
                {paidTabs.length} sales
              </span>
            </h3>
            <p className="themed-text-dim text-sm mt-1">View, edit or delete individual sale records</p>
          </div>
          {showSalesLog
            ? <ChevronUp size={18} className="themed-text-dim shrink-0" />
            : <ChevronDown size={18} className="themed-text-dim shrink-0" />
          }
        </button>

        <AnimatePresence>
          {showSalesLog && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t themed-border overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b themed-border bg-black/5 text-[10px] themed-text-dim uppercase tracking-[0.2em] font-black">
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4">Date</th>
                      <th className="py-4">Staff</th>
                      <th className="py-4">Items</th>
                      <th className="py-4 text-right">Total</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y themed-border">
                    {pagedSales.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center themed-text-dim opacity-40 font-black text-sm uppercase tracking-widest">
                          No sales recorded yet
                        </td>
                      </tr>
                    )}
                    {pagedSales.map(tab => {
                      const staffMember = staff.find(s => s.id === tab.staffId);
                      const isEditing = editingTabId === tab.id;
                      return (
                        <tr key={tab.id} className="hover:bg-black/5 transition-colors">
                          <td className="py-4 px-6">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  value={editName}
                                  onChange={e => setEditName(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setEditingTabId(null); }}
                                  autoFocus
                                  className="themed-bg-primary border border-[#4F6EF6]/40 rounded-xl px-3 py-1.5 themed-text text-xs focus:outline-none w-36"
                                />
                                <button onClick={confirmEdit} className="p-1.5 bg-[#4F6EF6]/10 border border-[#4F6EF6]/20 rounded-lg text-[#4F6EF6] hover:bg-[#4F6EF6]/20 transition-all">
                                  <Check size={12} />
                                </button>
                                <button onClick={() => setEditingTabId(null)} className="p-1.5 bg-black/5 border themed-border rounded-lg themed-text-dim hover:themed-text transition-all">
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <p className="font-black themed-text">{tab.customerName || <span className="opacity-40 italic font-normal">—</span>}</p>
                            )}
                          </td>
                          <td className="py-4 themed-text-dim font-mono text-[10px]">
                            {new Date(tab.updatedAt || tab.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-4 themed-text text-xs">{staffMember?.name || '—'}</td>
                          <td className="py-4 themed-text-dim">{tab.items.length}</td>
                          <td className="py-4 text-right font-mono font-black text-[#4F6EF6]">
                            KES {tab.total.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {onEditTab && !isEditing && (
                                <button
                                  onClick={() => startEdit(tab)}
                                  className="p-2 rounded-xl themed-text-dim hover:text-[#4F6EF6] hover:bg-[#4F6EF6]/5 transition-all"
                                  title="Edit customer name"
                                >
                                  <Edit3 size={13} />
                                </button>
                              )}
                              {onDeleteTab && (
                                <button
                                  onClick={() => onDeleteTab(tab.id, tab.customerName || 'this sale')}
                                  className="p-2 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all"
                                  title="Delete sale"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="p-4 border-t themed-border flex items-center justify-between gap-4">
                    <span className="text-[10px] themed-text-dim font-black uppercase tracking-widest">
                      Page {salesPage + 1} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSalesPage(p => Math.max(0, p - 1))}
                        disabled={salesPage === 0}
                        className="px-4 py-2 themed-bg-primary border themed-border rounded-xl text-xs font-black themed-text-dim hover:themed-text transition-all disabled:opacity-30"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setSalesPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={salesPage === totalPages - 1}
                        className="px-4 py-2 themed-bg-primary border themed-border rounded-xl text-xs font-black themed-text-dim hover:themed-text transition-all disabled:opacity-30"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function StatCard({ label, value, trend, positive, icon: Icon }: any) {
  return (
    <div className="luxury-card p-6 themed-bg-secondary border themed-border flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-black/5 border themed-border rounded-lg">
          <Icon size={18} className="text-[#4F6EF6]" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${positive ? 'text-[#4F6EF6]' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] themed-text-dim uppercase font-black tracking-widest mb-1 opacity-50">{label}</p>
        <h4 className="text-2xl font-black themed-text tracking-tighter">{value}</h4>
      </div>
    </div>
  );
}
