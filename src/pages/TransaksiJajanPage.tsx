import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storageService';
import { CATEGORIES } from '../constants';
import { TransactionCategory } from '../types';
import { formatRupiah, getTimePeriod, getTimePeriodLabel, formatDateTime } from '../utils/formatters';
import { ShoppingCart, Search, AlertCircle, ArrowRight, Clock, CheckCircle2, QrCode, AlertTriangle, TrendingDown, ShieldAlert } from 'lucide-react';
import { ReceiptModal } from '../components/common/ReceiptModal';
import { StudentAvatar } from '../components/common/StudentAvatar';

export const TransaksiJajanPage: React.FC = () => {
  const { students, showToast, refreshData, transactions, settings , uiStyle} = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  const minBalanceAlert = settings.min_balance_alert || 10000;
  const allowDebt = settings.allow_debt !== false;
  const maxDebtLimit = settings.max_debt_limit || 50000;

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('Makanan');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const currentPeriod = getTimePeriod(currentTime);
  const periodInfo = getTimePeriodLabel(currentPeriod);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    code: string;
    studentName: string;
    studentNis: string;
    amount: number;
    category: string;
    notes?: string;
    timePeriod: string;
  } | null>(null);

  const filteredStudents = students.filter(
    (s) =>
      s.status === 'aktif' &&
      (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.nis.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('warning', 'Pilih Santri', 'Silakan pilih santri terlebih dahulu.');
      return;
    }

    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numAmount || numAmount <= 0) {
      showToast('warning', 'Nominal Tidak Valid', 'Masukkan nominal jajan yang benar.');
      return;
    }

    const newBalance = selectedStudent.balance - numAmount;
    if (newBalance < 0) {
      if (!allowDebt) {
        showToast(
          'error',
          'Kasbon Tidak Diizinkan',
          `Saldo ${selectedStudent.name} (${formatRupiah(selectedStudent.balance)}) tidak mencukupi dan kasbon dinonaktifkan.`
        );
        return;
      }
      if (newBalance < -maxDebtLimit) {
        showToast(
          'error',
          'Melebihi Batas Kasbon',
          `Saldo santri akan menjadi ${formatRupiah(newBalance)}, melebihi batas maksimal hutang ${formatRupiah(maxDebtLimit)}.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const trx = await storageService.addTransaction({
        transaction_code: `TRX-${Date.now().toString().slice(-8)}`,
        student_id: selectedStudent.id,
        amount: numAmount,
        category: selectedCategory,
        notes: notes || `Jajan ${selectedCategory}`,
        created_by: 'Admin Kasir',
      });

      setReceiptData({
        isOpen: true,
        code: trx.transaction_code,
        studentName: selectedStudent.name,
        studentNis: selectedStudent.nis,
        amount: numAmount,
        category: selectedCategory,
        notes: trx.notes,
        timePeriod: trx.time_period,
      });

      setAmount('');
      setNotes('');
      await refreshData();
    } catch (e: any) {
      showToast('error', 'Gagal Transaksi', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetAmounts = [2000, 5000, 8000, 10000, 15000, 20000, 25000, 50000];

  return (
    <div className={`space-y-6 pb-8 ${isNeo ? "font-mono" : ""}`}>
      {/* Page Title & Time Detector Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            Kasir Transaksi Jajan Santri (POS)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aplikasi kasir jajan santri dengan pendeteksi waktu otomatis & proteksi saldo
          </p>
        </div>

        {/* Time Period Tag */}
        <div className={`px-4 py-2 rounded-2xl border ${periodInfo.badgeClass} flex items-center gap-3 shadow-xs`}>
          <span className="text-2xl">{periodInfo.icon}</span>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
              Sesi Waktu Otomatis
            </span>
            <span className="font-extrabold text-xs">
              {periodInfo.label} ({currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Cashier POS Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleTransaction} className="space-y-5 text-xs">
            {/* Step 1: Select Student */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                1. Pilih Santri
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setSelectedStudentId('');
                  }}
                  placeholder="Ketik Nama, NIS, atau Scan QR..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>

              {/* Student Search Dropdown */}
              {studentSearch && !selectedStudent && (
                <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-700 z-20 relative">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s, idx) => (
                      <button
                        key={`search-st-${s.id || idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setStudentSearch(`${s.name} (${s.nis})`);
                        }}
                        className="w-full text-left p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <StudentAvatar
                            src={s.avatar_url}
                            name={s.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{s.name}</p>
                            <p className="text-[10px] text-slate-400">{s.nis} • {s.class_name}</p>
                          </div>
                        </div>
                        <div>
                          {s.balance < 0 ? (
                            <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[10px] inline-flex items-center gap-1 shadow-xs">
                              🚨 HUTANG {formatRupiah(s.balance)}
                            </span>
                          ) : s.balance <= minBalanceAlert ? (
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-extrabold text-[10px] inline-flex items-center gap-1">
                              ⚠️ DANGER {formatRupiah(s.balance)}
                            </span>
                          ) : (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(s.balance)}</span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-center text-slate-400">Santri tidak ditemukan</p>
                  )}
                </div>
              )}

              {/* Selected Student Details Card with Red Danger Alert */}
              {selectedStudent && (
                <div>
                  {selectedStudent.balance < 0 ? (
                    /* In-Debt (Minus) Student Box */
                    <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-lg space-y-2 border border-rose-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StudentAvatar
                            src={selectedStudent.avatar_url}
                            name={selectedStudent.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shrink-0"
                          />
                          <div>
                            <h3 className="font-black text-white text-sm flex items-center gap-1.5">
                              {selectedStudent.name}
                              <span className="px-2 py-0.5 rounded bg-white text-rose-700 text-[10px] font-black uppercase">
                                STATUS MINUS
                              </span>
                            </h3>
                            <p className="text-[11px] text-rose-100">{selectedStudent.nis} • {selectedStudent.class_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-rose-200 block">Total Hutang Santri</span>
                          <span className="font-black text-white text-xl tracking-tight">
                            {formatRupiah(selectedStudent.balance)}
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/25 text-[11px] flex items-center gap-2 border border-white/20">
                        <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                        <span>Santri ini sedang berhutang ke koperasi. Saldo saat ini <strong>minus {formatRupiah(Math.abs(selectedStudent.balance))}</strong>.</span>
                      </div>
                    </div>
                  ) : selectedStudent.balance <= minBalanceAlert ? (
                    /* Low Balance / Sekarat Danger Box */
                    <div className="mt-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 text-rose-900 dark:text-rose-100 shadow-md space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StudentAvatar
                            src={selectedStudent.avatar_url}
                            name={selectedStudent.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500 shrink-0"
                          />
                          <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                              {selectedStudent.name}
                              <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                                DANGER SEKARAT
                              </span>
                            </h3>
                            <p className="text-[11px] text-slate-500">{selectedStudent.nis} • {selectedStudent.class_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Sisa Saldo Sekarat</span>
                          <span className="font-black text-rose-600 dark:text-rose-400 text-xl tracking-tight">
                            {formatRupiah(selectedStudent.balance)}
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-rose-100/90 dark:bg-rose-900/50 text-[11px] text-rose-800 dark:text-rose-200 flex items-center gap-2 border border-rose-200 dark:border-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Saldo santri dalam batas bahaya kritis (≤ {formatRupiah(minBalanceAlert)}). Segera ingatkan santri untuk top up!</span>
                      </div>
                    </div>
                  ) : (
                    /* Healthy Balance Box */
                    <div className="mt-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StudentAvatar
                          src={selectedStudent.avatar_url}
                          name={selectedStudent.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500 shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudent.name}</h3>
                          <p className="text-[10px] text-slate-500">{selectedStudent.nis} • {selectedStudent.class_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Saldo Saat Ini</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-300 text-lg">
                          {formatRupiah(selectedStudent.balance)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Category Selector */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                2. Kategori Jajanan
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`p-3 rounded-2xl font-bold text-xs border text-center transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Nominal */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                3. Total Nominal Jajan (Rp)
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              {/* Preset Nominal Chips */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mt-2">
                {presetAmounts.map((preset, idx) => (
                  <button
                    key={`preset-${preset}-${idx}`}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition-colors text-center"
                  >
                    +{formatRupiah(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Notes */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                4. Rincian / Catatan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="mis. Nasi Ayam, Es Teh 2 gelas, Pulpen Gel"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none"
              />
            </div>

            {/* Balance Guard & Kasbon / Hutang (Minus) Alert */}
            {selectedStudent && parseFloat(amount || '0') > 0 && parseFloat(amount || '0') > selectedStudent.balance && (
              <div className="space-y-2">
                {!allowDebt ? (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                    <span className="font-bold text-xs">
                      Peringatan: Saldo santri ({formatRupiah(selectedStudent.balance)}) tidak mencukupi, dan kebijakan pesantren menonaktifkan fitur kasbon / hutang.
                    </span>
                  </div>
                ) : (selectedStudent.balance - parseFloat(amount || '0')) < -maxDebtLimit ? (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                    <div className="text-xs">
                      <span className="font-extrabold block">Ditolak: Melebihi Batas Kasbon!</span>
                      <span>Saldo akan menjadi {formatRupiah(selectedStudent.balance - parseFloat(amount || '0'))}. Batas maksimal hutang santri adalah {formatRupiah(maxDebtLimit)}.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <div className="font-black flex items-center gap-1.5 text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                        <span>⚡ Transaksi Kasbon / Saldo Minus Diizinkan</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[10px] font-mono">NGUTANG</span>
                      </div>
                      <p className="leading-snug text-amber-800/90 dark:text-amber-300/90">
                        Saldo santri akan menjadi <strong className="text-rose-600 dark:text-rose-400 font-black">{formatRupiah(selectedStudent.balance - parseFloat(amount || '0'))} (MINUS)</strong>. Hutang santri akan otomatis tercatat dan muncul di laporan & daftar hutang santri.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            {(() => {
              const numVal = parseFloat(amount || '0');
              const isMinus = selectedStudent && numVal > selectedStudent.balance;
              const isOverLimit = isMinus && (selectedStudent.balance - numVal) < -maxDebtLimit;
              const isBlocked = isMinus && (!allowDebt || isOverLimit);

              return (
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedStudent || numVal <= 0 || isBlocked}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 cursor-pointer ${
                    isMinus && !isBlocked
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25 ring-2 ring-amber-400/50'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Memproses Kasir...</span>
                  ) : isMinus && !isBlocked ? (
                    <>
                      <span>Proses Jajan (Kasbon / Hutang Minus)</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <span>Proses Transaksi Jajan</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              );
            })()}
          </form>
        </div>

        {/* Right Column: Live Recent Transactions Feed */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-500" />
            Transaksi Jajan Terakhir
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {transactions.slice(0, 8).map((t, idx) => (
              <div key={t.id || `trx-${t.transaction_code}-${idx}`} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{t.student_name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {t.category} • {t.time_period.toUpperCase()} • {formatDateTime(t.created_at)}
                  </p>
                </div>
                <span className="font-extrabold text-rose-600 dark:text-rose-400">
                  -{formatRupiah(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thermal Receipt Modal */}
      {receiptData && (
        <ReceiptModal
          isOpen={receiptData.isOpen}
          onClose={() => setReceiptData(null)}
          title="Struk Transaksi Jajan Koperasi"
          type="jajan"
          receiptCode={receiptData.code}
          studentName={receiptData.studentName}
          studentNis={receiptData.studentNis}
          amount={receiptData.amount}
          categoryOrMethod={receiptData.category}
          notes={receiptData.notes}
          timePeriod={receiptData.timePeriod}
        />
      )}

      
    </div>
  );
};

