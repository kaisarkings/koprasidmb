import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';
import { getCardPaddingClass, getHeaderClass } from '../utils/themeUtils';
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
import { BarChart3, Clock, TrendingUp, Calendar, Utensils } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#6b7280'];

export const StatistikPage: React.FC = () => {
  const { transactions, topups, stats, uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  // Time of Day Peak Distribution (Pagi, Siang, Sore, Malam)
  const timePeriodStats = useMemo(() => {
    const map = { pagi: 0, siang: 0, sore: 0, malam: 0 };
    (transactions || []).forEach((t) => {
      if (map[t.time_period] !== undefined) {
        map[t.time_period] += t.amount;
      }
    });

    return [
      { name: 'Pagi (05-11)', amount: map.pagi, icon: '🌅' },
      { name: 'Siang (11-15)', amount: map.siang, icon: '☀️' },
      { name: 'Sore (15-18)', amount: map.sore, icon: '🌆' },
      { name: 'Malam (18-05)', amount: map.malam, icon: '🌙' },
    ];
  }, [transactions]);

  // 14-Day Trend Data
  const dailyTrendData = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const isoDate = d.toISOString().slice(0, 10);
      const dayTrxs = transactions.filter((t) => t.created_at.slice(0, 10) === isoDate);
      const dayTopUps = topups.filter((tp) => tp.created_at.slice(0, 10) === isoDate);
      
      const jajan = dayTrxs.reduce((sum, t) => sum + t.amount, 0);
      const topup = dayTopUps.reduce((sum, tp) => sum + tp.amount, 0);
      const diff = topup - jajan;
      
      list.push({
        date: dayLabel,
        jajan,
        topup,
        diff,
      });
    }
    return list;
  }, [transactions, topups]);

  return (
    <div className={`space-y-6 pb-8 ${isNeo ? "font-mono" : ""}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          Statistik & Analitik Koperasi
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Analisis statistik transaksi harian, pola jam jajan santri, dan riwayat harian
        </p>
      </div>

      {/* Time-of-Day Peak Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {timePeriodStats.map((period) => (
          <div
            key={period.name}
            className={getCardPaddingClass(uiStyle, "p-5 flex items-center justify-between")}
          >
            <div>
              <span className="text-2xl">{period.icon}</span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{period.name}</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {formatRupiah(period.amount)}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Total Keseluruhan
            </span>
          </div>
        ))}
      </div>

      {/* Daily Trend Bar Chart */}
      <div className={getCardPaddingClass(uiStyle, "p-6")}>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Tren Omset & Pemasukan (14 Hari Terakhir)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rp${v/1000}k`} />
              <Tooltip formatter={(value: number) => formatRupiah(value)} />
              <Bar dataKey="topup" fill="#10b981" radius={[6, 6, 0, 0]} name="Pemasukan TopUp" />
              <Bar dataKey="jajan" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Pengeluaran Jajan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Daily History Table */}
      <div className={getCardPaddingClass(uiStyle, "p-6")}>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-emerald-500" />
          Riwayat Ringkasan Per Hari
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Top-Up (Masuk)</th>
                <th className="py-2.5 px-3">Jajan (Keluar)</th>
                <th className="py-2.5 px-3 text-right">Selisih Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
              {[...dailyTrendData].reverse().map((day, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{day.date}</td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">{formatRupiah(day.topup)}</td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400">{formatRupiah(day.jajan)}</td>
                  <td className={`py-3 px-3 text-right font-bold ${day.diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {day.diff > 0 ? '+' : ''}{formatRupiah(day.diff)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

