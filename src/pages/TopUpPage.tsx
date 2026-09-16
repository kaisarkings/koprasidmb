import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storageService';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import { Wallet, Search, CheckCircle2, Printer, ArrowRight, User } from 'lucide-react';
import { ReceiptModal } from '../components/common/ReceiptModal';
import { StudentAvatar } from '../components/common/StudentAvatar';

export const TopUpPage: React.FC = () => {
  const { students, showToast, refreshData, topups , uiStyle} = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Transfer' | 'Potongan Gaji' | 'Lainnya'>('Tunai');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal
  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    code: string;
    studentName: string;
    studentNis: string;
    amount: number;
    method: string;
    notes?: string;
  } | null>(null);

  const filteredStudents = students.filter(
    (s) =>
      s.status === 'aktif' &&
      (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.nis.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('warning', 'Pilih Santri', 'Silakan pilih santri yang akan diisi saldonya.');
      return;
    }

    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numAmount || numAmount <= 0) {
      showToast('warning', 'Nominal Tidak Valid', 'Silakan masukkan nominal pengisian saldo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const topup = await storageService.addTopUp({
        topup_code: `TOP-${Date.now().toString().slice(-8)}`,
        student_id: selectedStudent.id,
        amount: numAmount,
        notes: notes || `Pengisian saldo via ${paymentMethod}`,
        payment_method: paymentMethod,
        created_by: 'Admin Koperasi',
      });

      setReceiptData({
        isOpen: true,
        code: topup.topup_code,
        studentName: selectedStudent.name,
        studentNis: selectedStudent.nis,
        amount: numAmount,
        method: paymentMethod,
        notes: topup.notes,
      });

      setAmount('');
      setNotes('');
      await refreshData();
    } catch (e: any) {
      showToast('error', 'Gagal Top Up', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetNominals = [10000, 20000, 50000, 100000, 200000, 500000];

  return (
    <div className={`space-y-6 pb-8 ${isNeo ? "font-mono" : ""}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-600" />
          Isi Saldo Tabungan Santri
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Formulir pengisian saldo tunai/transfer wali santri dengan cetak bukti pembayaran
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: TopUp Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleTopUp} className="space-y-5 text-xs">
            {/* Step 1: Search & Select Student */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                1. Cari & Pilih Santri
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>

              {/* Student Dropdown */}
              {studentSearch && !selectedStudent && (
                <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-700 z-20 relative">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s, idx) => (
                      <button
                        key={`tu-st-${s.id || idx}`}
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
                        <span className="font-bold text-emerald-600">{formatRupiah(s.balance)}</span>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-center text-slate-400">Santri tidak ditemukan</p>
                  )}
                </div>
              )}

              {/* Selected Student Banner */}
              {selectedStudent && (
                <div className="mt-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StudentAvatar
                      src={selectedStudent.avatar_url}
                      name={selectedStudent.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudent.name}</h3>
                      <p className="text-[10px] text-slate-500">{selectedStudent.nis} • {selectedStudent.class_name} • {selectedStudent.dormitory}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Saldo Saat Ini</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-300 text-base">
                      {formatRupiah(selectedStudent.balance)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Nominal */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                2. Nominal Pengisian Saldo (Rp)
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              {/* Preset Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                {presetNominals.map((nom) => (
                  <button
                    key={nom}
                    type="button"
                    onClick={() => setAmount(nom.toString())}
                    className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors text-center"
                  >
                    +{formatRupiah(nom)}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                3. Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Tunai', 'Transfer', 'Potongan Gaji', 'Lainnya'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border text-center transition-all ${
                      paymentMethod === m
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Notes */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                4. Catatan / Sumber Uang
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="mis. Titipan Bapak Supriadi via Bank BSI"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedStudent}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Proses Isi Saldo</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Recent TopUps Log */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Riwayat Top Up Terbaru
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {topups.slice(0, 7).map((tp, idx) => (
              <div key={tp.id || `tu-tp-${idx}`} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{tp.student_name}</p>
                  <p className="text-[10px] text-slate-400">{tp.payment_method} • {formatDateTime(tp.created_at)}</p>
                </div>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  +{formatRupiah(tp.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Receipt Popup */}
      {receiptData && (
        <ReceiptModal
          isOpen={receiptData.isOpen}
          onClose={() => setReceiptData(null)}
          title="Struk Bukti Isi Saldo"
          type="topup"
          receiptCode={receiptData.code}
          studentName={receiptData.studentName}
          studentNis={receiptData.studentNis}
          amount={receiptData.amount}
          categoryOrMethod={receiptData.method}
          notes={receiptData.notes}
        />
      )}

      
    </div>
  );
};

