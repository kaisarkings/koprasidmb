import React, { useEffect, useState } from 'react';
import {
  Send,
  Mail,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import { storageService, subscribeToDataChange } from '../../services/storageService';
import { DailySummaryReport, AppSettings } from '../../types';

export const DailySummaryPanel: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [reportsHistory, setReportsHistory] = useState<DailySummaryReport[]>([]);
  const [previewReport, setPreviewReport] = useState<DailySummaryReport | null>(null);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState<boolean>(true);

  // Load initial settings and reports history
  const loadData = async () => {
    const st = await storageService.getSettings();
    setSettings(st);
    if (st.email && !recipientEmail) {
      setRecipientEmail(st.email);
    } else if (!recipientEmail) {
      setRecipientEmail('koperasi@sirajuddin.ac.id');
    }

    const history = await storageService.getDailySummaries();
    setReportsHistory(history);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDataChange(loadData);
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleRunCloudFunction = async () => {
    if (!recipientEmail || isExecuting) return;
    setIsExecuting(true);
    setStatusMessage(null);

    try {
      const res = await reportService.triggerDailySummary(selectedDate, recipientEmail, 'manual_trigger');
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: res.message || `Laporan harian [${selectedDate}] berhasil dikirim ke ${recipientEmail}`,
        });
        setPreviewReport(res.report);
        const updatedHistory = await storageService.getDailySummaries();
        setReportsHistory(updatedHistory);
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Gagal menjalankan Firebase Cloud Function. Silakan coba lagi.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan sistem saat memproses ringkasan harian.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyEmailHtml = (htmlContent?: string) => {
    if (!htmlContent) return;
    navigator.clipboard.writeText(htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Firebase Cloud Function Integration Badge */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Firebase Cloud Function Integration
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Laporan Ringkasan Harian Otomatis
            </h2>
            <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed">
              Otomatisasi pengiriman ringkasan transaksi belanja santri dan top-up saldo ke email pengurus/admin
              setiap harinya secara otomatis via Firestore database trigger.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 flex flex-col items-center justify-center text-center space-y-1">
            <ShieldCheck className="w-6 h-6 text-emerald-200" />
            <span className="text-xs font-bold">Status Cloud Engine</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 text-[10px] font-black uppercase">
              Aktif & Terhubung
            </span>
          </div>
        </div>
      </div>

      {/* Main Execution Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Trigger & Config */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Send className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Pemicu Laporan Manual</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Tanggal Ringkasan
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Tujuan Admin
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="admin@sirajuddin.ac.id"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Otomatisasi Jadwal Harian
                </span>
                <input
                  type="checkbox"
                  checked={autoScheduleEnabled}
                  onChange={(e) => setAutoScheduleEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 leading-snug">
                Laporan harian akan diproses otomatis oleh Cloud Function setiap pukul 20:00 WIB.
              </p>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <button
              onClick={handleRunCloudFunction}
              disabled={isExecuting || !recipientEmail}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Cloud Function...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Jalankan & Kirim Laporan Hari Ini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Pratinjau Ringkasan Laporan ({selectedDate})
                </h3>
              </div>
              {previewReport && (
                <button
                  onClick={() => handleCopyEmailHtml(previewReport.email_content_html)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  {copiedHtml ? 'Tersalin!' : 'Salin HTML Email'}
                </button>
              )}
            </div>

            {previewReport ? (
              <div className="mt-4 space-y-4">
                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide block">
                      Total Top-Up
                    </span>
                    <p className="text-base font-black text-emerald-900 dark:text-emerald-100 mt-1">
                      Rp {previewReport.total_topups_amount.toLocaleString('id-ID')}
                    </p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {previewReport.total_topups_count} Transaksi
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide block">
                      Total Belanja
                    </span>
                    <p className="text-base font-black text-rose-900 dark:text-rose-100 mt-1">
                      Rp {previewReport.total_transactions_amount.toLocaleString('id-ID')}
                    </p>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                      {previewReport.total_transactions_count} Transaksi
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                      Net Arus Kas
                    </span>
                    <p
                      className={`text-base font-black mt-1 ${
                        previewReport.net_cash_flow >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {previewReport.net_cash_flow >= 0 ? '+' : ''}Rp{' '}
                      {previewReport.net_cash_flow.toLocaleString('id-ID')}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">TopUp - Belanja</span>
                  </div>
                </div>

                {/* Email HTML Container Box */}
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs max-h-56 overflow-y-auto space-y-1 custom-scrollbar border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-sans border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
                    <span>Tujuan Email: {previewReport.sent_to_email}</span>
                    <span className="text-emerald-400 font-bold">Status: {previewReport.status.toUpperCase()}</span>
                  </div>
                  <p className="text-slate-300 font-sans leading-relaxed text-xs">
                    {previewReport.log_message}
                  </p>
                </div>
              </div>
            ) : (
              <div className="my-8 text-center py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700/80 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Belum ada laporan diproses untuk tanggal ini
                </p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Klik tombol <strong>"Jalankan & Kirim Laporan Hari Ini"</strong> di panel sebelah kiri untuk memicu
                  eksekusi Cloud Function dan melihat pratinjau lengkap.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Powered by Firebase Firestore & Express Cloud Function Service</span>
            <span className="font-mono">ID: {previewReport?.id || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Historical Summary Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Riwayat Laporan Ringkasan Terproses (Firestore Database)
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
            {reportsHistory.length} Laporan
          </span>
        </div>

        {reportsHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Tanggal Laporan</th>
                  <th className="py-2.5 px-3">Total Top-Up</th>
                  <th className="py-2.5 px-3">Total Belanja</th>
                  <th className="py-2.5 px-3">Penerima Admin</th>
                  <th className="py-2.5 px-3">Pemicu</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                {reportsHistory.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {rep.report_date}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Rp {rep.total_topups_amount?.toLocaleString('id-ID') || '0'}
                    </td>
                    <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-mono font-bold">
                      Rp {rep.total_transactions_amount?.toLocaleString('id-ID') || '0'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{rep.sent_to_email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase">
                        {rep.trigger_type || 'manual'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setPreviewReport(rep)}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            Belum ada riwayat laporan ringkasan yang tersimpan di Firestore.
          </div>
        )}
      </div>
    </div>
  );
};
