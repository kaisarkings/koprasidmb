import React from 'react';
import { useApp } from '../../context/AppContext';
import { Palette, Moon, Sun, Check, Sparkles, X } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    themeMode,
    toggleTheme,
    uiStyle,
    setUIStyle,
  } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Kustomisasi Tampilan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih mode warna & gaya antarmuka
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Light / Dark Mode */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  themeMode === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-500'
                }`}
              >
                {themeMode === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Pencahayaan Layar
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {themeMode === 'dark' ? 'Mode Gelap Aktif' : 'Mode Terang Aktif'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Ubah ke {themeMode === 'dark' ? 'Terang' : 'Gelap'}
            </button>
          </div>

          {/* UI Style Mode */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Gaya Antarmuka
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setUIStyle('standard')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col gap-2 ${
                  uiStyle === 'standard'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">Biasa (Standar)</span>
                  {uiStyle === 'standard' && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Tampilan modern yang bersih dengan sudut melengkung dan bayangan halus.
                </p>
              </button>

              <button
                onClick={() => setUIStyle('neo-brutalism')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col gap-2 ${
                  uiStyle === 'neo-brutalism'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">Neo Brutalism</span>
                  {uiStyle === 'neo-brutalism' && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Gaya berani dengan warna kontras, garis tegas, dan bayangan tebal solid.
                </p>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
