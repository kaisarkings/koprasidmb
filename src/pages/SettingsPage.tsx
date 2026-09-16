import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';
import { FirestoreQuotaBanner } from '../components/common/FirestoreQuotaBanner';
import { storageService } from '../services/storageService';
import defaultSantriAvatar from '../assets/images/login_santri_avatar_1785105854262.jpg';
import pesantrenLogo from '../assets/images/sirajuddin_logo.jpg';
import { compressAndReadFileAsDataURL } from '../utils/fileHelpers';
import {
  Settings,
  Building2,
  Database,
  Save,
  Download,
  Upload,
  ShieldCheck,
  Server,
  Trash2,
  AlertTriangle,
  RefreshCw,
  FileJson,
  Image as ImageIcon,
  RotateCcw,
  Palette,
  AlertCircle,
  CreditCard,
  Sparkles,
  Check,
  Moon,
  Sun,
  Eye,
  LayoutTemplate,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import {
  
  
  
  
} from '../utils/theme';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    showToast,
    refreshData,




    themeMode,
    toggleTheme,
    uiStyle,
    toggleUIStyle,
    highContrast,
    toggleHighContrast
} = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  const [pesantrenName, setPesantrenName] = useState(settings.pesantren_name);
  const [koperasiName, setKoperasiName] = useState(settings.koperasi_name);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [treasurerName, setTreasurerName] = useState(settings.treasurer_name);
  const [headName, setHeadName] = useState(settings.head_pesantren_name);
  const [loginImageUrl, setLoginImageUrl] = useState(settings.login_image_url || pesantrenLogo);
  const [minBalanceAlert, setMinBalanceAlert] = useState<number>(settings.min_balance_alert || 10000);
  const [allowDebt, setAllowDebt] = useState<boolean>(settings.allow_debt !== false);
  const [maxDebtLimit, setMaxDebtLimit] = useState<number>(settings.max_debt_limit || 50000);
  
  
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLoginImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('info', 'Memproses Gambar', 'Mengompres dan memuat gambar dari file...');
      const dataUrl = await compressAndReadFileAsDataURL(file, 600);
      setLoginImageUrl(dataUrl);
      showToast('success', 'Gambar Terpilih', 'Gambar/Logo dari galeri berhasil dipasang. Klik "Simpan Identitas Koperasi" untuk menerapkan.');
    } catch (err: any) {
      showToast('error', 'Gagal Memuat Gambar', err.message || 'File tidak valid.');
    } finally {
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        pesantren_name: pesantrenName,
        koperasi_name: koperasiName,
        address,
        phone,
        treasurer_name: treasurerName,
        head_pesantren_name: headName,
        login_image_url: loginImageUrl,
        min_balance_alert: Number(minBalanceAlert) || 10000,
        allow_debt: allowDebt,
        max_debt_limit: Number(maxDebtLimit) || 50000,
      };

      await storageService.saveSettings(updatedSettings);
      
      

      showToast('success', 'Pengaturan Disimpan', 'Identitas pesantren, batasan saldo sekarat, kasbon hutang, dan tema berhasil diperbarui.');
      await refreshData();
    } catch (e: any) {
      showToast('error', 'Gagal Menyimpan', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Export JSON Backup
  const [resetModal, setResetModal] = useState<{
    isOpen: boolean;
    type: 'transactions' | 'balances' | 'all';
    title: string;
    description: string;
    dangerText: string;
  } | null>(null);

  const handleExportBackup = async () => {
    const students = await storageService.getStudents();
    const transactions = await storageService.getTransactions();
    const topups = await storageService.getTopUps();
    const currentSettings = await storageService.getSettings();

    const data = {
      app: 'Koperasi Santri',
      version: '3.0',
      export_date: new Date().toISOString(),
      students,
      transactions,
      topups,
      settings: currentSettings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_koperasi_santri_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Backup Diunduh', 'File cadangan data JSON berhasil diunduh ke komputer/HP Anda.');
  };

  // Restore JSON Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = JSON.parse(event.target?.result as string);
        const result = await storageService.restoreBackupData(jsonContent);
        showToast(
          'success',
          'Restore Berhasil!',
          `Berhasil memulihkan ${result.importedStudents} santri, ${result.importedTransactions} transaksi, dan ${result.importedTopups} topup.`
        );
        await refreshData();
      } catch (err: any) {
        showToast('error', 'Format File Tidak Valid', 'Gagal memproses file backup JSON. Pastikan file backup valid.');
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const confirmResetAction = async () => {
    if (!resetModal) return;
    try {
      if (resetModal.type === 'transactions') {
        await storageService.clearAllTransactionsAndTopups();
        showToast('success', 'Riwayat Dibersihkan', 'Seluruh data transaksi dan isi saldo telah dihapus.');
      } else if (resetModal.type === 'balances') {
        await storageService.resetAllStudentBalances();
        showToast('success', 'Saldo Direset', 'Saldo seluruh santri telah direset menjadi Rp 0.');
      } else if (resetModal.type === 'all') {
        await storageService.clearAllDataAndStartFromZero();
        showToast('success', 'Mulai Dari Nol', 'Seluruh data santri dan transaksi telah dikosongkan. Siap mengisi dari 0 secara manual.');
      }
      setResetModal(null);
      await refreshData();
    } catch (err: any) {
      showToast('error', 'Gagal Reset Data', err.message);
    }
  };

  const handleClearAllTransactions = () => {
    setResetModal({
      isOpen: true,
      type: 'transactions',
      title: 'Hapus Seluruh Pemasukan & Pengeluaran',
      description: 'Apakah Anda yakin ingin menghapus seluruh riwayat transaksi jajan dan top-up?',
      dangerText: 'Data transaksi yang dihapus TIDAK BISA KEMBALI dan saldo santri akan direset ke Rp 0.',
    });
  };

  const handleResetBalances = () => {
    setResetModal({
      isOpen: true,
      type: 'balances',
      title: 'Reset Saldo Santri ke Rp 0',
      description: 'Apakah Anda yakin ingin mereset saldo seluruh santri menjadi Rp 0?',
      dangerText: 'Lakukan ini HANYA jika ingin memulai periode/tahun ajaran baru.',
    });
  };

  const handleStartFromZero = () => {
    setResetModal({
      isOpen: true,
      type: 'all',
      title: 'Mulai Dari Nol (Kosongkan Semua Data Santri)',
      description: 'Tindakan ini akan MENGHAPUS SELURUH data santri, riwayat transaksi jajan, isi saldo, dan log aktivitas.',
      dangerText: 'Aplikasi akan bersih total dari 0. Anda bisa menginput data santri secara manual.',
    });
  };

  return (
    <div className={`space-y-6 pb-8 ${isNeo ? "font-mono" : ""}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden mb-6">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <Settings className="w-6 h-6 text-emerald-300" />
              Pengaturan Sistem & Database
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-xl">
              Konfigurasi identitas pesantren, Kop Laporan resmi, serta manajemen backup data cloud.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Kop Surat & Identitas */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" />
            Identitas Pondok Pesantren & Kop Laporan
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nama Pondok Pesantren *
                </label>
                <input
                  type="text"
                  required
                  value={pesantrenName}
                  onChange={(e) => setPesantrenName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nama Koperasi / KOPONTREN *
                </label>
                <input
                  type="text"
                  required
                  value={koperasiName}
                  onChange={(e) => setKoperasiName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Alamat Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  No. Telepon / Pengurus
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nama Administrator / Tanda Tangan Laporan
                </label>
                <input
                  type="text"
                  value={treasurerName}
                  onChange={(e) => setTreasurerName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>


              {/* UI Theme Customization Section */}
              <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Gaya Desain Aplikasi (UI)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ubah keseluruhan tata letak menjadi mode Neo Brutalism atau Standar.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleUIStyle}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      uiStyle === 'neo-brutalism' 
                        ? 'border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-600 dark:bg-purple-900/40 dark:text-purple-300' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{uiStyle === 'neo-brutalism' ? 'Neo Brutalism' : 'Standar'}</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Mode High Contrast (Keterbacaan Tinggi)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Gunakan warna super kontras (hitam/kuning/putih murni) agar lebih mudah dibaca.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleHighContrast}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      highContrast 
                        ? 'border-black bg-yellow-400 text-black' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{highContrast ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Login Picture & Logo Customization */}
              <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      Gambar / Logo Halaman Login
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Pilih foto atau logo dari galeri/file HP & Komputer Anda, atau masukkan link URL gambar.
                    </p>
                  </div>
                  <img
                    src={loginImageUrl && loginImageUrl.trim() !== '' ? loginImageUrl : pesantrenLogo}
                    alt="Preview Login"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = pesantrenLogo;
                    }}
                    className="w-14 h-14 object-cover rounded-xl border-2 border-emerald-500/40 shadow-xs shrink-0 bg-white"
                  />
                </div>

                <input
                  type="file"
                  ref={logoFileInputRef}
                  onChange={handleLoginImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Pilih Foto / Logo dari Galeri (File)
                  </button>

                  <input
                    type="text"
                    value={loginImageUrl}
                    onChange={(e) => setLoginImageUrl(e.target.value)}
                    placeholder="Atau tempel URL gambar di sini..."
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setLoginImageUrl(pesantrenLogo)}
                      title="Gunakan preset Logo Pesantren"
                      className="px-2.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Logo Siraj
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginImageUrl(defaultSantriAvatar)}
                      title="Gunakan preset Foto Santri"
                      className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      Foto Santri
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION: Pengaturan Batasan Saldo Sekarat & Kasbon Hutang */}
              <div className="sm:col-span-2 p-4 sm:p-5 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Batasan Saldo Sekarat & Fitur Kasbon / Hutang (Minus)
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Atur ambang batas peringatan warna merah bahaya saat uang santri mau habis, dan kendalikan izin kasbon (saldo minus).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Batas Saldo Sekarat (Danger Alert) */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Batas Saldo Sekarat (Peringatan Bahaya Merah) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-xs">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={minBalanceAlert}
                        onChange={(e) => setMinBalanceAlert(Number(e.target.value))}
                        className="w-full pl-10 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-500">Preset Cepat:</span>
                      {[5000, 10000, 15000, 20000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setMinBalanceAlert(val)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            minBalanceAlert === val
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                          }`}
                        >
                          {(val / 1000).toFixed(0)}rb
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium leading-snug">
                      ⚠️ Jika saldo santri ≤ Rp {minBalanceAlert.toLocaleString('id-ID')}, sistem kasir & daftar santri akan otomatis bertuliskan <strong>DANGER MERAH</strong>.
                    </p>
                  </div>

                  {/* Batas Maksimal Hutang / Minus */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Batas Maksimal Kasbon / Hutang (Minus) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-xs">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={maxDebtLimit}
                        onChange={(e) => setMaxDebtLimit(Number(e.target.value))}
                        className="w-full pl-10 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-500">Preset Cepat:</span>
                      {[20000, 50000, 100000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setMaxDebtLimit(val)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            maxDebtLimit === val
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                          }`}
                        >
                          {(val / 1000).toFixed(0)}rb
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Batas saldo minus maksimal yang boleh dipinjam santri saat jajan (cth: hingga -Rp {maxDebtLimit.toLocaleString('id-ID')}).
                    </p>
                  </div>

                  {/* Toggle Izin Kasbon / Minus */}
                  <div className="sm:col-span-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-rose-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          Izinkan Santri Jajan dengan Saldo Minus (Fitur Kasbon / Ngutang)
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Bila dicentang, kasir dapat melanjutkan transaksi walau saldo santri tidak cukup hingga batas maksimal.
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={allowDebt}
                        onChange={(e) => setAllowDebt(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              
              {/* SECTION: Kustomisasi Tema & UI Style */}
              <div className="sm:col-span-2 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Kustomisasi Mode Layar
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Atur pencahayaan layar terang atau gelap.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {themeMode === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{themeMode === 'dark' ? 'Mode Gelap' : 'Mode Terang'}</span>
                  </button>
                </div>
              </div>

            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Memproses...' : 'Simpan Seluruh Pengaturan'}
            </button>
          </form>

          {/* Danger Zone: Data Deletion & Resets */}
          <div className="mt-8 pt-6 border-t border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <h4 className="font-bold text-xs text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Zona Bahaya — Reset & Pengosongan Data
            </h4>
            <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mb-4 leading-relaxed">
              Opsi untuk mengosongkan riwayat transaksi jajan, reset saldo santri, atau memulai aplikasi bersih dari nol untuk input data santri manual.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleClearAllTransactions}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Seluruh Pemasukan & Pengeluaran
              </button>

              <button
                onClick={handleResetBalances}
                className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-950/60 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Saldo Santri ke Rp 0
              </button>

              <button
                onClick={handleStartFromZero}
                className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-100/80 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 font-extrabold text-xs hover:bg-rose-200 dark:hover:bg-rose-900 flex items-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Mulai Dari Nol (Kosongkan Data Santri & Transaksi)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Database Status & Backup Restore */}
        <div className="lg:col-span-1 space-y-6">
          {/* Database Status Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-500" />
                Status Database Cloud
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Firebase Firestore Active
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Aplikasi terhubung langsung ke <strong>Google Firebase Firestore Cloud</strong>. Semua data santri, transaksi jajan, dan saldo tersinkronisasi secara otomatis di seluruh perangkat.
            </p>
            <div className="mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden pt-2">
              <FirestoreQuotaBanner />
            </div>
          </div>

          {/* Backup & Restore Data Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              Backup & Restore Data JSON
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Unduh cadangan data atau pulihkan data santri dan riwayat transaksi dari file backup JSON.
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Unduh Backup Data (.JSON)
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isRestoring}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" />
                {isRestoring ? 'Memulihkan Data...' : 'Restore / Upload File Backup'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={Boolean(resetModal)}
        onClose={() => setResetModal(null)}
        title={resetModal?.title || 'Konfirmasi Tindakan'}
        maxWidth="sm"
      >
        {resetModal && (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-800 dark:text-rose-300 text-sm mb-1">Peringatan Keamanan</p>
                <p className="text-rose-700 dark:text-rose-400 font-medium leading-relaxed">
                  {resetModal.dangerText}
                </p>
              </div>
            </div>
            
            <p className="text-[13px] leading-relaxed">
              {resetModal.description}
            </p>
            
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Apakah Anda benar-benar yakin ingin melanjutkan?
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button
                onClick={() => setResetModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmResetAction}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-sm"
              >
                Ya, Saya Yakin
              </button>
            </div>
          </div>
        )}
      </Modal>

      
    </div>
  );
};

