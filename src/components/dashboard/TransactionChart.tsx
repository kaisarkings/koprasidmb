import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Transaction, TopUp } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { TrendingUp } from 'lucide-react';

interface TransactionChartProps {
  transactions: Transaction[];
  topups: TopUp[];
}

export const TransactionChart: React.FC<TransactionChartProps> = ({ transactions, topups }) => {
// Aggregate for the current month
  const chartData = React.useMemo(() => {
    const map = new Map<string, { date: string; displayDate: string; jajan: number; topup: number }>();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const displayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      map.set(iso, { date: iso, displayDate, jajan: 0, topup: 0 });
    }
    
    (transactions || []).forEach((t) => {
      const iso = t.created_at.slice(0, 10);
      if (map.has(iso)) {
        map.get(iso)!.jajan += t.amount;
      }
    });
    
    (topups || []).forEach((tp) => {
      const iso = tp.created_at.slice(0, 10);
      if (map.has(iso)) {
        map.get(iso)!.topup += tp.amount;
      }
    });
    
    return Array.from(map.values());
  }, [transactions, topups]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-slate-700/50 text-xs space-y-2 min-w-[160px]">
          <p className="font-bold text-slate-300 text-center pb-2 border-b border-slate-800/50">{label}</p>
          <div className="flex justify-between items-center gap-4">
            <span className="text-slate-400 font-medium">TopUp</span>
            <span className="text-emerald-400 font-bold">{formatRupiah(payload[0]?.value || 0)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-slate-400 font-medium">Jajan</span>
            <span className="text-rose-400 font-bold">{formatRupiah(payload[1]?.value || 0)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Grafik Arus Kas Bulan Ini
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Perbandingan Pemasukan (TopUp) vs Pengeluaran (Jajan)</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">TopUp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Jajan</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTopUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorJajan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickMargin={10} minTickGap={30} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rp${v/1000}k`} dx={-10} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" activeDot={{ r: 6, strokeWidth: 0 }} dataKey="topup" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTopUp)" />
            <Area type="monotone" activeDot={{ r: 6, strokeWidth: 0 }} dataKey="jajan" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorJajan)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
