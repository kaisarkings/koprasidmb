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
import { getCardClass, getHeaderClass } from '../utils/themeUtils';
import {
  Users,
  Wallet,
  ShoppingCart,
  TrendingUp,
  ArrowDownRight,
  ArrowRight,
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
  const { stats, topSantri, transactions, topups, settings, students, isLoading, uiStyle } = useApp();
  const { user } = useAuth();
  
  const isGuest = user?.role === 'guest';
  const minBalanceAlert = settings.min_balance_alert || 10000;

  const debtStudents = (students || []).filter((s) => s.balance < 0);
  const warningStudents = (students || []).filter((s) => s.balance >= 0 && s.balance <= minBalanceAlert);
  const totalDebt = debtStudents.reduce((acc, s) => acc + Math.abs(s.balance), 0);

  const safeStats = stats || { total_students: 0, active_students: 0, total_balance_all: 0, today_transactions_count: 0, today_income: 0, today_expense: 0, yesterday_income: 0, yesterday_expense: 0, this_month_expense: 0, this_month_topup: 0 };
  
  const isNeo = uiStyle === 'neo-brutalism';

  return (
    <div className={`space-y-6 pb-8 ${isNeo ? 'font-mono' : ''}`}>
      
      {/* HERO SECTION */}
      {isNeo ? (
        <div className="relative w-full rounded-[2rem] overflow-hidden border-[6px] border-black bg-purple-500 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-10 z-10 transition-transform hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
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
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center p-4 relative z-10 overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/bottts/svg?seed=KoperasiAI" alt="AI Mascot" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-yellow-400 border-[4px] border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-10deg] z-20 text-sm">
                ON FIRE 🔥
              </div>
            </div>
          </div>
        </div>
      ) : (
        <HeroCarousel />
      )}

      {/* Debt & Low Balance Alert Notice (If Any) */}
      {!isGuest && (debtStudents.length > 0 || warningStudents.length > 0) && (
        <div className={isNeo 
          ? "p-4 bg-orange-400 border-[4px] border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse"
          : "p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        }>
          <div className="flex items-start gap-3">
            <div className={isNeo ? "p-2 bg-red-600 border-[3px] border-black text-white shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5 animate-pulse"}>
              <ShieldAlert className={isNeo ? "w-6 h-6" : "w-5 h-5"} />
            </div>
            <div>
              <h4 className={isNeo ? "font-black text-lg text-black uppercase tracking-tight" : "font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2"}>
                Warning: Monitoring Saldo
              </h4>
              <p className={isNeo ? "text-sm font-bold text-black mt-1" : "text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1"}>
                Terdapat {debtStudents.length} santri berhutang (total {formatRupiah(totalDebt)}) dan {warningStudents.length} santri saldo sekarat.
              </p>
            </div>
          </div>
          <Link
            to="/santri"
            className={isNeo 
              ? "shrink-0 px-4 py-2 bg-white border-[3px] border-black text-black font-black text-sm uppercase flex items-center gap-1.5 hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all"
              : "shrink-0 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            }
          >
            Lihat Data
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats Overview Grid */}
      {isNeo ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-cyan-300 border-[4px] border-black rounded-tl-[3rem] rounded-br-[3rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black uppercase text-sm tracking-wider">Total Santri</h3>
              <div className="p-2 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-3">
                <Users className="w-6 h-6 text-black" />
              </div>
            </div>
            <p className="text-4xl font-black text-black">{safeStats.total_students}</p>
            <p className="text-sm font-bold mt-2 bg-white px-2 inline-block border-[2px] border-black">{safeStats.active_students} Aktif</p>
          </div>
          <div className="bg-lime-400 border-[4px] border-black rounded-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform flex flex-col justify-center text-center aspect-square sm:aspect-auto sm:rounded-3xl">
            <div className="flex justify-center items-start mb-2">
              <div className="p-2 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-6">
                <Wallet className="w-6 h-6 text-black" />
              </div>
            </div>
            <h3 className="font-black uppercase text-sm tracking-wider mb-1">Total Tabungan</h3>
            <p className="text-2xl sm:text-3xl font-black text-black truncate">{formatRupiah(safeStats.total_balance_all)}</p>
          </div>
          <div className="bg-pink-400 border-[4px] border-black rounded-tr-[3rem] rounded-bl-[3rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black uppercase text-sm tracking-wider">Transaksi Hari Ini</h3>
              <div className="p-2 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-12">
                <ShoppingCart className="w-6 h-6 text-black" />
              </div>
            </div>
            <p className="text-4xl font-black text-black">{safeStats.today_transactions_count}</p>
            <p className="text-sm font-bold mt-2 bg-white px-2 inline-block border-[2px] border-black">Jajan Tercatat</p>
          </div>
          <div className="bg-yellow-400 border-[4px] border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black uppercase text-sm tracking-wider">Pengeluaran Hari Ini</h3>
              <div className="p-2 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
            </div>
            <p className="text-3xl font-black text-black truncate">{formatRupiah(safeStats.today_expense)}</p>
            <div className="mt-2 flex items-center gap-1 font-bold text-sm bg-white px-2 py-0.5 border-[2px] border-black w-fit">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
              TopUp: {formatRupiah(safeStats.today_income)}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Santri"
            value={safeStats.total_students.toString()}
            subtitle={`${safeStats.active_students} Santri Aktif`}
            icon={Users}
            trend={{ value: 2.5, isPositive: true }}
            color="indigo"
          />
          <StatCard
            title="Total Tabungan (Saldo)"
            value={formatRupiah(safeStats.total_balance_all)}
            subtitle="Akumulasi Seluruh Santri"
            icon={Wallet}
            color="emerald"
          />
          <StatCard
            title="Transaksi Hari Ini"
            value={safeStats.today_transactions_count.toString()}
            subtitle="Transaksi POS Jajan"
            icon={ShoppingCart}
            trend={{ value: 12.5, isPositive: true }}
            color="sky"
          />
          <StatCard
            title="Pengeluaran Hari Ini"
            value={formatRupiah(safeStats.today_expense)}
            subtitle={`Pemasukan TopUp: ${formatRupiah(safeStats.today_income)}`}
            icon={TrendingUp}
            trend={{ value: safeStats.today_expense > safeStats.yesterday_expense ? 5 : -2, isPositive: false }}
            color="amber"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {!isGuest && (
            <div className={getCardClass(uiStyle)}>
              <h2 className={isNeo ? "text-2xl font-black uppercase mb-6 flex items-center gap-2" : "text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"}>
                {isNeo && <span className="bg-purple-400 px-2 border-[2px] border-black -rotate-3">🚀 QUICK</span>}
                {!isNeo && <Zap className="w-5 h-5 text-emerald-500" />}
                POS KASIR CEPAT
              </h2>
              <QuickPOSWidget />
            </div>
          )}

          <div className={getCardClass(uiStyle) + (isNeo ? " p-0" : "")}>
            <div className={getHeaderClass(uiStyle, 'cyan-400')}>
              <h2 className="text-xl font-black uppercase">📈 Grafik Transaksi</h2>
            </div>
            {!isNeo && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Grafik Transaksi
                </h2>
              </div>
            )}
            <div className={isNeo ? "p-6" : ""}>
              <TransactionChart />
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className={getCardClass(uiStyle) + (isNeo ? " p-0" : "")}>
             <div className={getHeaderClass(uiStyle, 'rose-400')}>
              <h2 className="text-lg font-black uppercase">🏆 Top Santri</h2>
             </div>
             <div className={isNeo ? "p-4" : ""}>
               <TopSantriTable topSantri={topSantri || []} />
             </div>
          </div>
          
          <div className={getCardClass(uiStyle) + (isNeo ? " p-0" : "")}>
             <div className={getHeaderClass(uiStyle, 'lime-400')}>
              <h2 className="text-lg font-black uppercase">📊 Kategori Jajan</h2>
             </div>
             <div className={isNeo ? "p-4" : ""}>
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

