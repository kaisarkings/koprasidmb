import re

content = """import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../utils/formatters';
import { StatCard } from '../components/common/StatCard';
import { QuickPOSWidget } from '../components/dashboard/QuickPOSWidget';
import { TopSantriTable } from '../components/dashboard/TopSantriTable';
import { TransactionChart } from '../components/dashboard/TransactionChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { HeroCarousel } from '../components/dashboard/HeroCarousel';
import { Link } from 'react-router-dom';
import {
  Users,
  Wallet,
  ShoppingCart,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  Zap,
  Gamepad2
} from 'lucide-react';
import { motion } from 'motion/react';

export const DashboardPage: React.FC = () => {
  const { stats, topSantri, transactions, topups, settings, students } = useApp();
  const { user } = useAuth();
  
  const isGuest = user?.role === 'guest';
  const minBalanceAlert = settings.min_balance_alert || 10000;

  const debtStudents = (students || []).filter((s) => s.balance < 0);
  const warningStudents = (students || []).filter((s) => s.balance >= 0 && s.balance <= minBalanceAlert);
  const totalDebt = debtStudents.reduce((acc, s) => acc + Math.abs(s.balance), 0);

  return (
    <div className="space-y-8 pb-8 font-mono">
      {/* NEO-BRUTALISM HERO SECTION */}
      <div className="relative w-full rounded-[2rem] overflow-hidden border-[6px] border-black bg-purple-500 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-10 z-10 transition-transform hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 border-[6px] border-black rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-0 animate-spin-slow"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-pink-500 border-[6px] border-black rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-0"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row gap-8 items-center justify-between">
          <div className="max-w-xl">
            <div className="inline-block px-4 py-2 bg-lime-400 border-[4px] border-black font-black uppercase text-sm mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
              ✨ SISTEM AI KOPERASI V2.0
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-4" style={{ WebkitTextStroke: '2px black' }}>
              {isGuest ? 'PORTAL WALI SANTRI' : 'TOP-UP & KASIR KOPERASI'}
            </h1>
            <p className="text-xl font-bold bg-white text-black p-2 border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block rotate-1 mb-6">
              Lebih Cepat, Mudah, dan Transparan!
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              {!isGuest && (
                <>
                  <Link to="/topup" className="px-6 py-3 bg-cyan-400 border-[4px] border-black rounded-full font-black uppercase flex items-center gap-2 hover:bg-cyan-300 active:translate-y-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <Zap className="w-5 h-5" fill="currentColor" />
                    TopUp Cepat
                  </Link>
                  <Link to="/kasir" className="px-6 py-3 bg-rose-400 border-[4px] border-black rounded-full font-black uppercase flex items-center gap-2 hover:bg-rose-300 active:translate-y-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <Gamepad2 className="w-5 h-5" />
                    Kasir POS
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="shrink-0 relative">
            {/* Mascot or Web Top-up style illustration */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center p-4 relative z-10 overflow-hidden">
               <img src="https://api.dicebear.com/7.x/bottts/svg?seed=KoperasiAI" alt="AI Mascot" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-yellow-400 border-[4px] border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-10deg] z-20 text-sm">
              ON FIRE 🔥
            </div>
          </div>
        </div>
      </div>

      {/* Debt & Low Balance Alert Notice (If Any) */}
      {!isGuest && (debtStudents.length > 0 || warningStudents.length > 0) && (
        <div className="p-4 bg-orange-400 border-[4px] border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-600 border-[3px] border-black text-white shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-lg text-black uppercase tracking-tight">
                Warning: Monitoring Saldo
              </h4>
              <p className="text-sm font-bold text-black mt-1">
                Terdapat {debtStudents.length} santri berhutang (total {formatRupiah(totalDebt)}) dan {warningStudents.length} santri saldo sekarat.
              </p>
            </div>
          </div>
          <Link
            to="/santri"
            className="shrink-0 px-4 py-2 bg-white border-[3px] border-black text-black font-black text-sm uppercase flex items-center gap-1.5 hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Lihat Data
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats Overview Grid - Neo Brutalism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students - Different shape */}
        <div className="bg-cyan-300 border-[4px] border-black rounded-tl-[3rem] rounded-br-[3rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black uppercase text-sm tracking-wider">Total Santri</h3>
            <div className="p-2 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-3">
              <Users className="w-6 h-6 text-black" />
            </div>
          </div>
          <p className="text-4xl font-black text-black">{stats.total_students}</p>
          <p className="text-sm font-bold mt-2 bg-white px-2 inline-block border-[2px] border-black">{stats.active_students} Aktif</p>
        </div>

        {/* Total Balance */}
        <div className="bg-lime-400 border-[4px] border-black rounded-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform flex flex-col justify-center text-center aspect-square sm:aspect-auto sm:rounded-3xl">
          <div className="flex justify-center items-start mb-2">
            <div className="p-2 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-6">
              <Wallet className="w-6 h-6 text-black" />
            </div>
          </div>
          <h3 className="font-black uppercase text-sm tracking-wider mb-1">Total Tabungan</h3>
          <p className="text-2xl sm:text-3xl font-black text-black truncate">{formatRupiah(stats.total_balance_all)}</p>
        </div>

        {/* Today's Transactions */}
        <div className="bg-pink-400 border-[4px] border-black rounded-tr-[3rem] rounded-bl-[3rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black uppercase text-sm tracking-wider">Transaksi Hari Ini</h3>
            <div className="p-2 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-12">
              <ShoppingCart className="w-6 h-6 text-black" />
            </div>
          </div>
          <p className="text-4xl font-black text-black">{stats.today_transactions_count}</p>
          <p className="text-sm font-bold mt-2 bg-white px-2 inline-block border-[2px] border-black">Jajan Tercatat</p>
        </div>

        {/* Today's Expense */}
        <div className="bg-yellow-400 border-[4px] border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black uppercase text-sm tracking-wider">Pengeluaran Hari Ini</h3>
            <div className="p-2 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-3">
              <TrendingUp className="w-6 h-6 text-black" />
            </div>
          </div>
          <p className="text-3xl font-black text-black truncate">{formatRupiah(stats.today_expense)}</p>
          <div className="mt-2 flex items-center gap-1 font-bold text-sm bg-white px-2 py-0.5 border-[2px] border-black w-fit">
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            TopUp: {formatRupiah(stats.today_income)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {!isGuest && (
            <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6">
              <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                <span className="bg-purple-400 px-2 border-[2px] border-black -rotate-3">🚀 QUICK</span> POS
              </h2>
              <QuickPOSWidget />
            </div>
          )}

          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-0 overflow-hidden">
            <div className="bg-cyan-400 p-4 border-b-[4px] border-black">
              <h2 className="text-xl font-black uppercase">📈 Grafik Transaksi</h2>
            </div>
            <div className="p-6">
              <TransactionChart />
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
             <div className="bg-rose-400 p-4 border-b-[4px] border-black flex justify-between items-center">
              <h2 className="text-lg font-black uppercase">🏆 Top Santri</h2>
             </div>
             <div className="p-4">
               <TopSantriTable />
             </div>
          </div>
          
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
             <div className="bg-lime-400 p-4 border-b-[4px] border-black flex justify-between items-center">
              <h2 className="text-lg font-black uppercase">📊 Kategori Jajan</h2>
             </div>
             <div className="p-4">
               <CategoryPieChart />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
"""

with open('src/pages/DashboardPage.tsx', 'w') as f:
    f.write(content)
