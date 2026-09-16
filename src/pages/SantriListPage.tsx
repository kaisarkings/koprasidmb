import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Student } from '../types';
import { DEFAULT_CLASSES, DEFAULT_DORMITORIES } from '../constants';
import { formatRupiah, formatDate } from '../utils/formatters';
import { SantriFormModal } from '../components/santri/SantriFormModal';
import { SantriQRModal } from '../components/santri/SantriQRModal';
import { StudentAvatar } from '../components/common/StudentAvatar';
import { Modal } from '../components/common/Modal';
import { useNavigate, Link } from 'react-router-dom';
import { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';
import {
  Users,
  Plus,
  Search,
  Filter,
  QrCode,
  Edit,
  Trash2,
  Wallet,
  Phone,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const SantriListPage: React.FC = () => {
  const { user } = useAuth();
  const { students, searchQuery, setSearchQuery, showToast, refreshData, settings, uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';
  const navigate = useNavigate();

  const minBalanceAlert = settings.min_balance_alert || 10000;

  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterDormitory, setFilterDormitory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBalance, setFilterBalance] = useState<'all' | 'debt' | 'warning' | 'safe'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [qrModalStudent, setQrModalStudent] = useState<Student | null>(null);

  const [quickTopUpStudent, setQuickTopUpStudent] = useState<Student | null>(null);
  const [quickTopUpAmount, setQuickTopUpAmount] = useState<string>('');
  const [quickTopUpNotes, setQuickTopUpNotes] = useState<string>('');

  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<Student | null>(null);

  const debtCount = useMemo(() => (students || []).filter((s) => s.balance < 0).length, [students]);
  const warningCount = useMemo(
    () => (students || []).filter((s) => s.balance >= 0 && s.balance <= minBalanceAlert).length,
    [students, minBalanceAlert]
  );

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return (students || []).filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.parent_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = filterClass === 'all' || s.class_name === filterClass;
      const matchDormitory = filterDormitory === 'all' || s.dormitory === filterDormitory;
      const matchStatus = filterStatus === 'all' || s.status === filterStatus;

      let matchBalance = true;
      if (filterBalance === 'debt') {
        matchBalance = s.balance < 0;
      } else if (filterBalance === 'warning') {
        matchBalance = s.balance >= 0 && s.balance <= minBalanceAlert;
      } else if (filterBalance === 'safe') {
        matchBalance = s.balance > minBalanceAlert;
      }

      return matchSearch && matchClass && matchDormitory && matchStatus && matchBalance;
    });
  }, [students, searchQuery, filterClass, filterDormitory, filterStatus, filterBalance, minBalanceAlert]);

  const handleSaveStudent = async (studentData: Partial<Student>) => {
    try {
      await storageService.saveStudent(studentData as any);
      showToast(
        'success',
        studentData.id ? 'Data Diperbarui' : 'Santri Ditambahkan',
        `Data santri ${studentData.name} berhasil disimpan.`
      );
      await refreshData();
    } catch (e: any) {
      showToast('error', 'Gagal Menyimpan', e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmStudent) return;
    try {
      await storageService.deleteStudent(deleteConfirmStudent.id);
      showToast('info', 'Santri Dihapus', `Data santri ${deleteConfirmStudent.name} telah dihapus.`);
      setDeleteConfirmStudent(null);
      await refreshData();
    } catch (e: any) {
      showToast('error', 'Gagal Menghapus', e.message);
    }
  };

  const handleQuickTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTopUpStudent) return;

    const num = parseFloat(quickTopUpAmount);
    if (!num || num <= 0) {
      showToast('warning', 'Nominal Tidak Valid', 'Masukkan nominal top up yang benar.');
      return;
    }

    try {
      await storageService.addTopUp({
        topup_code: `TOP-${Date.now().toString().slice(-8)}`,
        student_id: quickTopUpStudent.id,
        amount: num,
        notes: quickTopUpNotes || 'Isi Saldo Cepat Data Santri',
        payment_method: 'Tunai',
        created_by: 'Admin Koperasi',
      });

      showToast('success', 'Isi Saldo Berhasil', `Saldo ${quickTopUpStudent.name} bertambah ${formatRupiah(num)}.`);
      setQuickTopUpStudent(null);
      setQuickTopUpAmount('');
      setQuickTopUpNotes('');
      await refreshData();
    } catch (e: any) {
      showToast('error', 'Gagal Top Up', e.message);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Data Santri Pondok
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola profil, kelas, asrama, dan saldo seluruh santri terdaftar
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setStudentToEdit(null);
              setIsFormModalOpen(true);
            }}
            className={getButtonClass(uiStyle)}
          >
            <Plus className="w-4 h-4" />
            Tambah Santri Baru
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className={getCardClass(uiStyle)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama, NIS, Orang Tua..."
              className={`pl-9 ${getInputClass(uiStyle)}`}
            />
          </div>

          {/* Filter Kelas */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="all">Semua Kelas</option>
            {DEFAULT_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Filter Asrama */}
          <select
            value={filterDormitory}
            onChange={(e) => setFilterDormitory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="all">Semua Asrama</option>
            {DEFAULT_DORMITORIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non-Aktif</option>
          </select>
        </div>

        {/* Balance Status Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Status Saldo & Hutang:</span>
          <button
            type="button"
            onClick={() => setFilterBalance('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterBalance === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Semua ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterBalance('debt')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              filterBalance === 'debt'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            }`}
          >
            <span>🚨 Berhutang / Minus</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filterBalance === 'debt' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
              }`}
            >
              {debtCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterBalance('warning')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              filterBalance === 'warning'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>⚠️ Saldo Sekarat (≤ {formatRupiah(minBalanceAlert)})</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filterBalance === 'warning' ? 'bg-white text-amber-800' : 'bg-amber-600 text-white'
              }`}
            >
              {warningCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterBalance('safe')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterBalance === 'safe'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            ✓ Saldo Aman
          </button>
        </div>

        {/* View Mode Switcher & Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{filteredStudents.length}</strong> dari {students.length} Santri
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
              Tabel
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kartu
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Santri</th>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Kelas / Asrama</th>
                  <th className="py-3 px-4">Orang Tua / HP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Saldo Saat Ini</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => (
                    <tr key={`${student.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div
                          onClick={() => navigate(`/santri/${student.id}`)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <StudentAvatar
                            src={student.avatar_url}
                            name={student.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-slate-400">Masuk: {formatDate(student.joined_date)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {student.nis}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{student.class_name}</p>
                        <p className="text-[10px] text-slate-400">{student.dormitory}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{student.parent_name}</p>
                        <a
                          href={`https://wa.me/${student.parent_phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          {student.parent_phone}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        {student.status === 'aktif' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-semibold text-[10px]">
                            <XCircle className="w-3 h-3" />
                            Non-Aktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {student.balance < 0 ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="font-black text-rose-600 dark:text-rose-400 text-sm tracking-tight">
                              {formatRupiah(student.balance)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                              HUTANG MINUS
                            </span>
                          </div>
                        ) : student.balance <= minBalanceAlert ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="font-black text-rose-600 dark:text-rose-400 text-sm tracking-tight">
                              {formatRupiah(student.balance)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[9px] font-extrabold border border-rose-300 dark:border-rose-800">
                              DANGER SEKARAT
                            </span>
                          </div>
                        ) : (
                          <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                            {formatRupiah(student.balance)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setQuickTopUpStudent(student)}
                            title="Isi Saldo Cepat"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>TopUp</span>
                          </button>
                          <button
                            onClick={() => setQrModalStudent(student)}
                            title="Kartu QR Santri"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <QrCode className="w-4 h-4 text-indigo-500" />
                          </button>
                          {user?.role === 'admin' && (
                            <>
                              <button
                                onClick={() => {
                                  setStudentToEdit(student);
                                  setIsFormModalOpen(true);
                                }}
                                title="Edit Santri"
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                <Edit className="w-4 h-4 text-amber-500" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmStudent(student)}
                                title="Hapus Santri"
                                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada santri yang sesuai dengan kriteria pencarian
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Layout View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, idx) => (
            <div
              key={`${student.id}-${idx}`}
              className={getCardPaddingClass(uiStyle, "p-5 space-y-3 hover:shadow-md transition-shadow relative group cursor-pointer")}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  onClick={() => navigate(`/santri/${student.id}`)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <StudentAvatar
                    src={student.avatar_url}
                    name={student.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {student.nis}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setQrModalStudent(student)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 dark:text-slate-300"
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Kelas / Asrama:</span>
                  <span className="font-semibold">{student.class_name} • {student.dormitory}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Wali:</span>
                  <span className="font-semibold">{student.parent_name}</span>
                </div>
              </div>

              {student.balance < 0 ? (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase block">Hutang Santri:</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black uppercase">STATUS MINUS</span>
                  </div>
                  <span className="font-black text-rose-600 dark:text-rose-400 text-base">
                    {formatRupiah(student.balance)}
                  </span>
                </div>
              ) : student.balance <= minBalanceAlert ? (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase block">Sisa Saldo:</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wide">DANGER SEKARAT</span>
                  </div>
                  <span className="font-black text-rose-600 dark:text-rose-400 text-base">
                    {formatRupiah(student.balance)}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Saldo Tabungan:</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-300 text-base">
                    {formatRupiah(student.balance)}
                  </span>
                </div>
              )}

              {user?.role !== 'guest' && (
  <div className="flex items-center justify-between gap-2 pt-1">
    <button
      onClick={() => setQuickTopUpStudent(student)}
      className={getButtonClass(uiStyle, "primary", "flex-1 py-1.5 text-xs")}
    >
      <Wallet className="w-3.5 h-3.5" />
      Isi Saldo
    </button>
    <div className="flex gap-1.5">
      {user?.role === 'admin' && (
        <>
          <button
            onClick={() => {
              setStudentToEdit(student);
              setIsFormModalOpen(true);
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          >
            <Edit className="w-4 h-4 text-amber-500" />
          </button>
          <button
            onClick={() => setDeleteConfirmStudent(student)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  </div>
)}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <SantriFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      {/* QR Code Modal */}
      <SantriQRModal
        isOpen={Boolean(qrModalStudent)}
        onClose={() => setQrModalStudent(null)}
        student={qrModalStudent}
      />

      {/* Quick TopUp Modal */}
      <Modal
        isOpen={Boolean(quickTopUpStudent)}
        onClose={() => setQuickTopUpStudent(null)}
        title="Isi Saldo Cepat Santri"
        subtitle={`Pengisian saldo tunai untuk ${quickTopUpStudent?.name}`}
        maxWidth="md"
      >
        {quickTopUpStudent && (
          <form onSubmit={handleQuickTopUpSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{quickTopUpStudent.name}</p>
                <p className="text-slate-500 font-mono">{quickTopUpStudent.nis}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Saldo Saat Ini</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                  {formatRupiah(quickTopUpStudent.balance)}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominal Top Up (Rp) *
              </label>
              <input
                type="number"
                required
                value={quickTopUpAmount}
                onChange={(e) => setQuickTopUpAmount(e.target.value)}
                placeholder="50000"
                className={getInputClass(uiStyle)}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[10000, 20000, 50000, 100000, 200000].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuickTopUpAmount(num.toString())}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 font-bold text-[10px]"
                  >
                    +{formatRupiah(num)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan</label>
              <input
                type="text"
                value={quickTopUpNotes}
                onChange={(e) => setQuickTopUpNotes(e.target.value)}
                placeholder="mis. Titipan Orang Tua"
                className={getInputClass(uiStyle)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setQuickTopUpStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
              >
                Proses Top Up
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmStudent)}
        onClose={() => setDeleteConfirmStudent(null)}
        title="Konfirmasi Hapus Santri"
        maxWidth="sm"
      >
        {deleteConfirmStudent && (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <p>
              Apakah Anda yakin ingin menghapus santri{' '}
              <strong className="text-slate-900 dark:text-white">{deleteConfirmStudent.name}</strong> ({deleteConfirmStudent.nis})?
            </p>
            <p className="text-rose-500 font-semibold text-[11px]">
              Tindakan ini tidak dapat dibatalkan. Riwayat transaksi santri ini akan dihapus.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        )}
      </Modal>

      
    </div>
  );
};

