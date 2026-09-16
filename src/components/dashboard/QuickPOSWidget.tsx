import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { CATEGORIES } from '../../constants';
import { TransactionCategory } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ShoppingCart, Wallet, Search, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, AlertCircle } from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';

export const QuickPOSWidget: React.FC = () => {
  const { students, showToast, refreshData, settings } = useApp();
  const [activeTab, setActiveTab] = useState<'jajan' | 'topup'>('jajan');

  const minBalanceAlert = settings.min_balance_alert || 10000;
  const allowDebt = settings.allow_debt !== false;
  const maxDebtLimit = settings.max_debt_limit || 50000;

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('Makanan');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    type: 'jajan' | 'topup';
    code: string;
    studentName: string;
    studentNis: string;
    amount: number;
    categoryOrMethod: string;
    notes?: string;
    timePeriod?: string;
  } | null>(null);

  const filteredStudents = students.filter(
    (s) =>
      s.status === 'aktif' &&
      (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.nis.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('warning', 'Pilih Santri', 'Silakan pilih santri terlebih dahulu.');
      return;
    }

    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numAmount || numAmount <= 0) {
      showToast('warning', 'Nominal Tidak Valid', 'Silakan masukkan nominal yang benar.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'jajan') {
        const newBalance = selectedStudent.balance - numAmount;
        if (newBalance < 0) {
          if (!allowDebt) {
            showToast(
              'error',
              'Kasbon Ditolak',
              `Saldo ${selectedStudent.name} (${formatRupiah(selectedStudent.balance)}) tidak cukup. Fitur hutang/kasbon sedang dinonaktifkan.`
            );
            setIsSubmitting(false);
            return;
          }
          if (newBalance < -maxDebtLimit) {
            showToast(
              'error',
              'Melebihi Batas Kasbon',
              `Saldo santri akan menjadi ${formatRupiah(newBalance)}, melebihi batas maksimal hutang ${formatRupiah(maxDebtLimit)}.`
            );
            setIsSubmitting(false);
            return;
          }
        }

        const trx = await storageService.addTransaction({
          transaction_code: `TRX-${Date.now().toString().slice(-8)}`,
          student_id: selectedStudent.id,
          amount: numAmount,
          category,
          notes: notes || `Jajan ${category}`,
          created_by: 'Admin Kasir',
        });

        setReceiptData({
          isOpen: true,
          type: 'jajan',
          code: trx.transaction_code,
          studentName: selectedStudent.name,
          studentNis: selectedStudent.nis,
          amount: numAmount,
          categoryOrMethod: category,
          notes: trx.notes,
          timePeriod: trx.time_period,
        });
      } else {
        // Top Up
        const topup = await storageService.addTopUp({
          topup_code: `TOP-${Date.now().toString().slice(-8)}`,
          student_id: selectedStudent.id,
          amount: numAmount,
          notes: notes || 'Isi Saldo Kasir Dashboard',
          payment_method: 'Tunai',
          created_by: 'Admin Kasir',
        });

        setReceiptData({
          isOpen: true,
          type: 'topup',
          code: topup.topup_code,
          studentName: selectedStudent.name,
          studentNis: selectedStudent.nis,
          amount: numAmount,
          categoryOrMethod: 'Tunai',
          notes: topup.notes,
        });
      }

      // Reset form
      setAmount('');
      setNotes('');
      await refreshData();
    } catch (err: any) {
      showToast('error', 'Gagal Transaksi', err.message || 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetAmounts = [5000, 10000, 15000, 20000, 50000];

  return (
    <div className="">
      {/* Tab Selector */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('jajan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'jajan'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Kasir Jajan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('topup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'topup'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Isi Saldo (Top Up)
          </button>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Sistem Transaksi Cepat</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Student */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Pilih Santri
          </label>
          <div className="relative">
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                setSelectedStudentId('');
              }}
              placeholder="Ketik Nama atau NIS Santri..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Search Dropdown / List */}
          {studentSearch && !selectedStudent && (
            <div className="mt-1 max-h-40 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg divide-y divide-slate-100 dark:divide-slate-700 z-20 relative">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, idx) => (
                  <button
                    key={`qp-st-${s.id || idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(s.id);
                      setStudentSearch(`${s.name} (${s.nis})`);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                      <p className="text-[10px] text-slate-400">{s.nis} • {s.class_name}</p>
                    </div>
                    {s.balance < 0 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[10px]">
                        🚨 HUTANG {formatRupiah(s.balance)}
                      </span>
                    ) : s.balance <= minBalanceAlert ? (
                      <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-300 dark:border-rose-800">
                        ⚠️ SEKARAT {formatRupiah(s.balance)}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(s.balance)}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <p className="p-3 text-xs text-slate-400 text-center">Santri tidak ditemukan</p>
              )}
            </div>
          )}

          {/* Selected Student Info Badge with Danger Alerts */}
          {selectedStudent && (
            <div>
              {selectedStudent.balance < 0 ? (
                /* Debt Box */
                <div className="mt-2 p-2.5 rounded-xl bg-rose-600 text-white shadow-xs flex items-center justify-between text-xs animate-pulse">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <span className="font-black text-white">{selectedStudent.name} (BERHUTANG)</span>
                      <p className="text-[10px] text-rose-100">{selectedStudent.class_name} • Saldo santri minus!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-rose-200 uppercase font-bold block">Total Hutang</span>
                    <span className="font-black text-white text-sm">
                      {formatRupiah(selectedStudent.balance)}
                    </span>
                  </div>
                </div>
              ) : selectedStudent.balance <= minBalanceAlert ? (
                /* Low Balance Danger Box */
                <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-400 text-rose-800 dark:text-rose-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        {selectedStudent.name}
                        <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-bold">DANGER SEKARAT</span>
                      </span>
                      <p className="text-[10px] text-rose-600/90 dark:text-rose-300/90">Uang santri kritis (≤ {formatRupiah(minBalanceAlert)})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-rose-600 dark:text-rose-400 block font-semibold">Sisa Saldo</span>
                    <span className="font-black text-rose-700 dark:text-rose-300 text-sm">
                      {formatRupiah(selectedStudent.balance)}
                    </span>
                  </div>
                </div>
              ) : (
                /* Normal Healthy Box */
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedStudent.name}</span>
                      <p className="text-[10px] text-slate-500">{selectedStudent.class_name} • {selectedStudent.dormitory}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Saldo Saat Ini</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {formatRupiah(selectedStudent.balance)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category (For Jajan Only) */}
        {activeTab === 'jajan' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kategori Jajan
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold text-center transition-all ${
                    category === cat.name
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nominal (Rp)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {presetAmounts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p.toString())}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
              >
                +{formatRupiah(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan opsional (mis. Nasi goreng, Es Teh)..."
            className="w-full px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          />
        </div>

        {/* Debt / Minus Alert Preview (For Jajan) */}
        {activeTab === 'jajan' && selectedStudent && parseFloat(amount || '0') > selectedStudent.balance && (
          <div>
            {!allowDebt ? (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Saldo tidak cukup dan fitur hutang/kasbon sedang dinonaktifkan.</span>
              </div>
            ) : (selectedStudent.balance - parseFloat(amount || '0')) < -maxDebtLimit ? (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Melebihi limit kasbon maksimal ({formatRupiah(maxDebtLimit)}).</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-[11px] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>Kasbon diizinkan:</strong> Saldo santri akan menjadi <strong className="text-rose-600 dark:text-rose-400">{formatRupiah(selectedStudent.balance - parseFloat(amount || '0'))} (MINUS)</strong>.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {(() => {
          const numVal = parseFloat(amount || '0');
          const isJajanMinus = activeTab === 'jajan' && selectedStudent && numVal > selectedStudent.balance;
          const isOverLimit = isJajanMinus && (selectedStudent.balance - numVal) < -maxDebtLimit;
          const isBlocked = isJajanMinus && (!allowDebt || isOverLimit);

          return (
            <button
              type="submit"
              disabled={isSubmitting || !selectedStudent || numVal <= 0 || isBlocked}
              className={`w-full py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                isJajanMinus && !isBlocked
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                  : activeTab === 'jajan'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : isJajanMinus && !isBlocked ? (
                <>
                  <span>Proses Jajan (Kasbon / Saldo Minus)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>
                    {activeTab === 'jajan' ? 'Proses Transaksi Jajan' : 'Proses Isi Saldo'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          );
        })()}
      </form>

      {/* Receipt Modal Popup */}
      {receiptData && (
        <ReceiptModal
          isOpen={receiptData.isOpen}
          onClose={() => setReceiptData(null)}
          title={receiptData.type === 'jajan' ? 'Struk Transaksi Jajan' : 'Struk Isi Saldo'}
          type={receiptData.type}
          receiptCode={receiptData.code}
          studentName={receiptData.studentName}
          studentNis={receiptData.studentNis}
          amount={receiptData.amount}
          categoryOrMethod={receiptData.categoryOrMethod}
          notes={receiptData.notes}
          timePeriod={receiptData.timePeriod}
        />
      )}
    </div>
  );
};
