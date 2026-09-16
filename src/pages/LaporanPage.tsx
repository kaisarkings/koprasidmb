import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';
import { exportReportToPDF, exportToExcelOrCSV, formatRupiah, formatDate } from '../utils/formatters';
import { FileSpreadsheet, FileText, Download, Calendar, Users, Building2, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { DailySummaryPanel } from '../components/reports/DailySummaryPanel';

export const LaporanPage: React.FC = () => {
  const { students, transactions, topups, settings, showToast , uiStyle} = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  const [activeTab, setActiveTab] = useState<'ekspor' | 'cloud_summary'>('cloud_summary');
  const [reportType, setReportType] = useState<'semua' | 'santri' | 'harian' | 'mingguan' | 'bulanan'>('semua');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [formatType, setFormatType] = useState<'pdf' | 'xlsx' | 'csv'>('pdf');

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleGenerateReport = () => {
    let reportTitle = 'LAPORAN REKAPITULASI KOPERASI SANTRI';
    let periodSubtitle = `Diunduh pada ${formatDate(new Date().toISOString())}`;

    let targetTrxs = [...transactions];
    let targetTopups = [...topups];

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (reportType === 'harian') {
      reportTitle = 'LAPORAN TRANSAKSI HARIAN KOPERASI SANTRI';
      periodSubtitle = `Tanggal: ${formatDate(todayStr)}`;
      targetTrxs = transactions.filter((t) => t.created_at.slice(0, 10) === todayStr);
      targetTopups = topups.filter((tp) => tp.created_at.slice(0, 10) === todayStr);
    } else if (reportType === 'mingguan') {
      reportTitle = 'LAPORAN TRANSAKSI MINGGUAN KOPERASI SANTRI';
      periodSubtitle = 'Rentang 7 Hari Terakhir';
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      targetTrxs = transactions.filter((t) => new Date(t.created_at) >= startOfWeek);
      targetTopups = topups.filter((tp) => new Date(tp.created_at) >= startOfWeek);
    } else if (reportType === 'bulanan') {
      reportTitle = 'LAPORAN TRANSAKSI BULANAN KOPERASI SANTRI';
      periodSubtitle = `Bulan ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      targetTrxs = transactions.filter((t) => new Date(t.created_at) >= startOfMonth);
      targetTopups = topups.filter((tp) => new Date(tp.created_at) >= startOfMonth);
    } else if (reportType === 'santri') {
      if (!selectedStudent) {
        showToast('warning', 'Pilih Santri', 'Silakan pilih santri terlebih dahulu.');
        return;
      }
      reportTitle = `LAPORAN REKENING TABUNGAN SANTRI - ${selectedStudent.name.toUpperCase()}`;
      periodSubtitle = `NIS: ${selectedStudent.nis} | Kelas: ${selectedStudent.class_name}`;
      targetTrxs = transactions.filter((t) => t.student_id === selectedStudent.id);
      targetTopups = topups.filter((tp) => tp.student_id === selectedStudent.id);
    }

    try {
      if (formatType === 'pdf') {
        exportReportToPDF(
          reportTitle,
          periodSubtitle,
          settings,
          students,
          targetTrxs,
          targetTopups,
          reportType === 'santri' ? selectedStudent : undefined
        );
        showToast('success', 'PDF Dibuat', 'Laporan PDF resmi berhasil diunduh.');
      } else {
        const cleanTitle = reportTitle.toLowerCase().replace(/\s+/g, '_');
        exportToExcelOrCSV(cleanTitle, targetTrxs, targetTopups, formatType);
        showToast('success', 'File Dibuat', `Laporan ${formatType.toUpperCase()} berhasil diunduh.`);
      }
    } catch (e: any) {
      showToast('error', 'Gagal Membuat Laporan', e.message);
    }
  };

  return (
    <div className={`space-y-6 pb-8 ${isNeo ? "font-mono" : ""}`}>
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Laporan & Rekapitulasi Keuangan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ringkasan harian otomatis Firebase Cloud Function dan ekspor dokumen PDF/Excel
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('cloud_summary')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cloud_summary'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Ringkasan Harian (Cloud Function)
          </button>
          <button
            onClick={() => setActiveTab('ekspor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ekspor'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor File (PDF / Excel)
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'cloud_summary' ? (
        <DailySummaryPanel />
      ) : (
        <div className="space-y-6">
          {/* Generator Form Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 text-xs">
            {/* Step 1: Report Type */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">
                1. Jenis Laporan
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'semua', label: 'Semua Transaksi' },
                  { id: 'harian', label: 'Laporan Harian' },
                  { id: 'mingguan', label: 'Laporan Mingguan' },
                  { id: 'bulanan', label: 'Laporan Bulanan' },
                  { id: 'santri', label: 'Per Santri' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setReportType(item.id as any)}
                    className={`p-3.5 rounded-2xl font-bold border text-center transition-all ${
                      reportType === item.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Student if 'santri' selected */}
            {reportType === 'santri' && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs mb-1.5">
                  Pilih Santri
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-none"
                >
                  <option value="">-- Pilih Santri --</option>
                  {students.map((s, idx) => (
                    <option key={`st-opt-${s.id || idx}`} value={s.id}>
                      {s.name} ({s.nis}) - Saldo: {formatRupiah(s.balance)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 3: Format Selector */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">
                2. Format File Output
              </label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setFormatType('pdf')}
                  className={`p-3.5 rounded-2xl font-bold border flex items-center justify-center gap-2 transition-all ${
                    formatType === 'pdf'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  PDF Resmi
                </button>
                <button
                  type="button"
                  onClick={() => setFormatType('xlsx')}
                  className={`p-3.5 rounded-2xl font-bold border flex items-center justify-center gap-2 transition-all ${
                    formatType === 'xlsx'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => setFormatType('csv')}
                  className={`p-3.5 rounded-2xl font-bold border flex items-center justify-center gap-2 transition-all ${
                    formatType === 'csv'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  CSV Data
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateReport}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Download className="w-5 h-5" />
              Unduh Laporan Keuangan
            </button>
          </div>

          {/* PDF Header Preview Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Preview Kop Surat Laporan Resmi
            </h3>
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 text-center font-serif text-slate-800 dark:text-slate-200">
              <h4 className="font-extrabold text-base uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                {settings.pesantren_name}
              </h4>
              <p className="font-bold text-xs">{settings.koperasi_name}</p>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">{settings.address} | Telp: {settings.phone}</p>
              <div className="my-3 border-b-2 border-emerald-600" />
              <p className="font-sans font-extrabold text-xs tracking-wide">
                LAPORAN REKAPITULASI TRANSAKSI TABUNGAN SANTRI
              </p>
              <p className="font-sans text-[10px] text-slate-400 mt-1">
                Dilengkapi Tanda Tangan Digital Pengurus Koperasi & Header Resmi Pondok
              </p>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};


