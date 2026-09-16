import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storageService';
import { ActivityLog } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';
import { History, Search, Filter, Calendar, ArrowDownRight, ArrowUpRight, Trash2, ShieldAlert } from 'lucide-react';
import { ReceiptModal } from '../components/common/ReceiptModal';

const SystemLogsView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const loadLogs = () => {
    storageService.getLogs().then(setLogs);
  };

  useEffect(() => {
    loadLogs();
    window.addEventListener('koperasi_data_changed', loadLogs);
    return () => window.removeEventListener('koperasi_data_changed', loadLogs);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Log Aktivitas Keamanan & Reset</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4">Pengguna</th>
              <th className="py-3 px-4">Aksi</th>
              <th className="py-3 px-4">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{formatDateTime(log.created_at)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{log.user_name}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.details}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">Belum ada log aktivitas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const RiwayatPage: React.FC = () => {
  const { transactions, topups, searchQuery, setSearchQuery, showToast, refreshData, uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  const [typeFilter, setTypeFilter] = useState<'all' | 'jajan' | 'topup' | 'system_logs'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const handleDeleteItem = async (e: React.MouseEvent, log: any) => {
    e.stopPropagation();
    const isTopUp = log.type === 'topup';
    const label = isTopUp ? `Isi Saldo ${log.code}` : `Transaksi Jajan ${log.code}`;
    
    if (confirm(`Apakah Anda yakin ingin menghapus data ${label}? Saldo santri ${log.student_name} akan disesuaikan otomatis.`)) {
      try {
        if (isTopUp) {
          await storageService.deleteTopUp(log.id);
        } else {
          await storageService.deleteTransaction(log.id);
        }
        showToast('success', 'Data Dihapus', `${label} berhasil dihapus.`);
        await refreshData();
      } catch (err: any) {
        showToast('error', 'Gagal Menghapus', err.message);
      }
    }
  };

  const [selectedReceipt, setSelectedReceipt] = useState<{
    isOpen: boolean;
    type: 'jajan' | 'topup';
    code: string;
    studentName: string;
    studentNis: string;
    amount: number;
    categoryOrMethod: string;
    notes?: string;
    timePeriod?: string;
    dateStr: string;
  } | null>(null);

  // Combine & filter logs
  const combinedLogs = useMemo(() => {
    const list: any[] = [];

    if (typeFilter === 'all' || typeFilter === 'topup') {
      (topups || []).forEach((tp) => {
        list.push({
          id: tp.id,
          code: tp.topup_code,
          type: 'topup' as const,
          student_id: tp.student_id,
          student_name: tp.student_name || 'Santri',
          student_nis: tp.student_nis || '-',
          amount: tp.amount,
          categoryOrMethod: tp.payment_method,
          notes: tp.notes || 'Isi Saldo',
          created_at: tp.created_at,
        });
      });
    }

    if (typeFilter === 'all' || typeFilter === 'jajan') {
      (transactions || []).forEach((tr) => {
        if (categoryFilter === 'all' || tr.category === categoryFilter) {
          list.push({
            id: tr.id,
            code: tr.transaction_code,
            type: 'jajan' as const,
            student_id: tr.student_id,
            student_name: tr.student_name || 'Santri',
            student_nis: tr.student_nis || '-',
            amount: tr.amount,
            categoryOrMethod: tr.category,
            notes: tr.notes || tr.category,
            time_period: tr.time_period,
            created_at: tr.created_at,
          });
        }
      });
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply search & date filter
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return list.filter((item) => {
      const matchSearch =
        item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student_nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      const itemDate = new Date(item.created_at);

      if (dateRangeFilter === 'today') {
        return item.created_at.slice(0, 10) === todayStr;
      } else if (dateRangeFilter === 'week') {
        return itemDate >= startOfWeek;
      } else if (dateRangeFilter === 'month') {
        return itemDate >= startOfMonth;
      }

      return true;
    });
  }, [transactions, topups, typeFilter, categoryFilter, dateRangeFilter, searchQuery]);

  return (
    <div className={`space-y-6 pb-8 ${isNeo ? "font-mono" : ""}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-600" />
          Riwayat Seluruh Transaksi & Log Sistem
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Histori lengkap transaksi jajan, pengisian saldo, dan log reset/aktivitas sistem
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setTypeFilter('all')}
          className={`pb-2 text-sm font-bold border-b-2 transition-colors ${typeFilter !== 'system_logs' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Riwayat Transaksi
        </button>
        <button
          onClick={() => setTypeFilter('system_logs' as any)}
          className={`pb-2 text-sm font-bold border-b-2 transition-colors ${typeFilter === 'system_logs' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Log Aktivitas Sistem
        </button>
      </div>

      {typeFilter === 'system_logs' ? (
        <SystemLogsView />
      ) : (
        <>
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Santri, NIS, Kode Struk..."
              className={`pl-9 ${getInputClass(uiStyle)}`}
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="all">Semua Jenis Transaksi</option>
            <option value="jajan">Transaksi Jajan Koperasi</option>
            <option value="topup">Isi Saldo (Top Up)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={typeFilter === 'topup'}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none disabled:opacity-50"
          >
            <option value="all">Semua Kategori Jajan</option>
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
            <option value="Snack">Snack</option>
            <option value="ATK">ATK</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="all">Semua Rentang Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">Bulan Ini</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Kode Struk</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Santri</th>
                <th className="py-3 px-4">Kategori / Metode</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {combinedLogs.length > 0 ? (
                combinedLogs.map((log, idx) => (
                  <tr
                    key={`${log.id}-${log.code}-${idx}`}
                    onClick={() =>
                      setSelectedReceipt({
                        isOpen: true,
                        type: log.type,
                        code: log.code,
                        studentName: log.student_name,
                        studentNis: log.student_nis,
                        amount: log.amount,
                        categoryOrMethod: log.categoryOrMethod,
                        notes: log.notes,
                        timePeriod: log.time_period,
                        dateStr: log.created_at,
                      })
                    }
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {log.code}
                    </td>
                    <td className="py-3 px-4">
                      {log.type === 'topup' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                          <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                          TopUp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          Jajan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {log.student_name}
                      <span className="block text-[10px] font-normal text-slate-400">{log.student_nis}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {log.categoryOrMethod}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{log.notes}</td>
                    <td className="py-3 px-4 text-right font-black text-sm">
                      <span className={log.type === 'topup' ? 'text-emerald-600' : 'text-rose-600'}>
                        {log.type === 'topup' ? '+' : '-'}{formatRupiah(log.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => handleDeleteItem(e, log)}
                        title="Hapus Data Ini"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada riwayat transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Struk Popup Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={selectedReceipt.isOpen}
          onClose={() => setSelectedReceipt(null)}
          title="Bukti Struk Transaksi"
          type={selectedReceipt.type}
          receiptCode={selectedReceipt.code}
          studentName={selectedReceipt.studentName}
          studentNis={selectedReceipt.studentNis}
          amount={selectedReceipt.amount}
          categoryOrMethod={selectedReceipt.categoryOrMethod}
          notes={selectedReceipt.notes}
          timePeriod={selectedReceipt.timePeriod}
          dateStr={selectedReceipt.dateStr}
        />
      )}
      </>
      )}

      
    </div>
  );
};

