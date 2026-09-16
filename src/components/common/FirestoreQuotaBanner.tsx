import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, RefreshCw, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { clearFirestoreQuotaExceeded, isFirestoreQuotaExceeded } from '../../services/storageService';

export const FirestoreQuotaBanner: React.FC = () => {
  const { refreshData } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState<boolean | null>(null);

  const quotaExceeded = isFirestoreQuotaExceeded();

  if (!quotaExceeded) {
    return null;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetrySuccess(null);
    try {
      await clearFirestoreQuotaExceeded();
      await refreshData();
      if (!isFirestoreQuotaExceeded()) {
        setRetrySuccess(true);
        setTimeout(() => {
          setRetrySuccess(null);
        }, 4000);
      } else {
        setRetrySuccess(false);
      }
    } catch (err: any) {
      console.warn('Retry Firestore failed:', err);
      setRetrySuccess(false);
    } finally {
      setIsRetrying(false);
    }
  };

  const consoleUrl =
    'https://console.firebase.google.com/project/intense-equinox-52gpt/firestore/databases/ai-studio-remixremixkopera-a3b6d9b8-c068-4a08-8b9d-296c827cbbab/data?openUpgradeDialog=true';

  if (isDismissed) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-300 dark:border-amber-800/40 px-4 py-1.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Mode Offline / Cache Lokal Aktif:</strong> Kuota tulis Firestore tercapai. Transaksi tetap berjalan normal.
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="underline hover:text-amber-900 dark:hover:text-amber-100 font-medium ml-2"
        >
          Lihat Detail
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="Peringatan Kuota Firestore" className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-orange-50 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-orange-950/40 border-b border-amber-300/80 dark:border-amber-700/50 px-4 py-3 sm:px-6 shadow-sm relative z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-900 dark:text-amber-100 text-sm">
                Batas Kuota Harian Firestore Tercapai (Resource Exhausted)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-200/70 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                Mode Offline / Cache Aktif
              </span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-200/90 leading-relaxed max-w-3xl">
              Batas kuota harian gratis Firebase Firestore (<em>Free daily write units per project</em>) telah tercapai hari ini. 
              <strong> Tenang, aplikasi tetap berjalan lancar 100%!</strong> Transaksi kasir POS, tambah saldo, data santri, dan cetak struk otomatis disimpan di cache lokal browser Anda. Kuota akan direset otomatis esok hari oleh Firebase.
            </p>
            {retrySuccess === true && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pemeriksaan ulang berhasil dikirim ke server.</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm disabled:opacity-50"
            title="Coba sinkronkan ulang sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Mengecek...' : 'Cek Ulang'}</span>
          </button>

          <a
            href={consoleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
            title="Buka Firebase Console Database"
          >
            <span>Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/40 transition"
            title="Sembunyikan pesan"
            aria-label="Tutup banner peringatan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
