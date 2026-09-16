import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getTimePeriod, getTimePeriodLabel, formatRupiah, formatDateTime } from '../../utils/formatters';
import {
  TRANSACTION_SUCCESS_EVENT,
  TOPUP_SUCCESS_EVENT,
  TransactionSuccessDetail,
  TopUpSuccessDetail,
} from '../../services/storageService';
import { CloudOff, Cloud, RefreshCw, Search, Sun, Moon, LogOut, Menu, UserCheck, Shield, Clock, Bell, Wallet, ArrowDownRight, ArrowUpRight, ShoppingBag, X, Trash2, Check, Palette } from 'lucide-react';

import { ProfileModal } from './ProfileModal';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import defaultSantriAvatar from '../../assets/images/login_santri_avatar_1785105854262.jpg';
import pesantrenLogo from '../../assets/images/sirajuddin_logo.jpg';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export interface RealtimeNotifItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'jajan' | 'topup';
  amount: number;
  isRead?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme, searchQuery, setSearchQuery, settings, transactions, topups, hasUnsyncedData } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const navbarRef = React.useRef<HTMLHeadingElement>(null);

  const [realtimeNotifications, setRealtimeNotifications] = useState<RealtimeNotifItem[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('koperasi_read_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = audioCtx.currentTime;
      playTone(523.25, now, 0.4);      
      playTone(698.46, now + 0.15, 0.6); 
    } catch (e) {
      console.error('Audio play failed', e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Listen to live real-time transaction & topup events
  useEffect(() => {
    const handleTransaction = (e: Event) => {
      const detail = (e as CustomEvent<TransactionSuccessDetail>).detail;
      if (!detail) return;
      const newItem: RealtimeNotifItem = {
        id: 'rt-tr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        title: 'Transaksi Jajan Berhasil',
        message: `${detail.studentName} (${detail.studentNis}) jajan ${detail.category} sejumlah ${formatRupiah(detail.amount)}. Saldo sisa: ${formatRupiah(detail.updatedBalance)}.`,
        time: new Date().toISOString(),
        type: 'jajan',
        amount: detail.amount,
        isRead: false,
      };
      setRealtimeNotifications((prev) => [newItem, ...prev]);
      playNotificationSound();
    };

    const handleTopUp = (e: Event) => {
      const detail = (e as CustomEvent<TopUpSuccessDetail>).detail;
      if (!detail) return;
      const newItem: RealtimeNotifItem = {
        id: 'rt-tp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        title: 'Top Up Berhasil',
        message: `Pengisian saldo ${formatRupiah(detail.amount)} (${detail.paymentMethod}) untuk ${detail.studentName} (${detail.studentNis}). Saldo baru: ${formatRupiah(detail.updatedBalance)}.`,
        time: new Date().toISOString(),
        type: 'topup',
        amount: detail.amount,
        isRead: false,
      };
      setRealtimeNotifications((prev) => [newItem, ...prev]);
      playNotificationSound();
    };

    window.addEventListener(TRANSACTION_SUCCESS_EVENT, handleTransaction);
    window.addEventListener(TOPUP_SUCCESS_EVENT, handleTopUp);

    return () => {
      window.removeEventListener(TRANSACTION_SUCCESS_EVENT, handleTransaction);
      window.removeEventListener(TOPUP_SUCCESS_EVENT, handleTopUp);
    };
  }, []);

  // Combine live notifications with recent topups & transactions
  const allNotifications = useMemo(() => {
    const items: RealtimeNotifItem[] = [...realtimeNotifications];

    (topups || []).forEach((tp) => {
      const id = `notif-tp-${tp.id}`;
      if (!items.some((i) => i.id === id)) {
        items.push({
          id,
          title: 'Top Up Berhasil',
          message: `Pengisian saldo ${formatRupiah(tp.amount)} (${tp.payment_method}) untuk ${tp.student_name || 'Santri'} (${tp.student_nis || '-'}).`,
          time: tp.created_at,
          type: 'topup',
          amount: tp.amount,
        });
      }
    });

    (transactions || []).forEach((tr) => {
      const id = `notif-tr-${tr.id}`;
      if (!items.some((i) => i.id === id)) {
        items.push({
          id,
          title: 'Transaksi Jajan Berhasil',
          message: `${tr.student_name || 'Santri'} (${tr.student_nis || '-'}) jajan ${tr.category} sejumlah ${formatRupiah(tr.amount)}.`,
          time: tr.created_at,
          type: 'jajan',
          amount: tr.amount,
        });
      }
    });

    return items
      .map((item) => ({
        ...item,
        isRead: item.isRead || readNotifIds.includes(item.id),
      }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 25);
  }, [realtimeNotifications, topups, transactions, readNotifIds]);

  const markAsRead = (id: string) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('koperasi_read_notifs', JSON.stringify(updated.slice(-100)));
      return updated;
    });
  };

  const clearAllNotifications = () => {
    const allIds = allNotifications.map((n) => n.id);
    setReadNotifIds(allIds);
    localStorage.setItem('koperasi_read_notifs', JSON.stringify(allIds));
    setRealtimeNotifications([]);
  };

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  const currentPeriod = getTimePeriod(currentTime);
  const periodInfo = getTimePeriodLabel(currentPeriod);

  // Business Fund (Dana Bisnis) Calculations
  const businessFund = useMemo(() => {
    const totalIncome = topups.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
    const netCash = totalIncome - totalExpense;
    return { totalIncome, totalExpense, netCash };
  }, [topups, transactions]);

  return (
    <header ref={navbarRef} className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Title/Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Buka Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Optional Brand Logo Badge on Navbar Header */}
          {settings.login_image_url && settings.login_image_url.trim() !== '' && (
            <img
              src={settings.login_image_url}
              alt="Logo Koperasi"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = pesantrenLogo;
              }}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/30 shadow-xs bg-white shrink-0 hidden sm:block"
            />
          )}

          {/* Quick Instant Search */}
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri, NIS, atau transaksi..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Time Indicator, Theme Toggle & User Menu */}
        <div className="flex items-center gap-3">
          {/* Automatic Time Period Detector Tag */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-xs font-medium transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="text-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">{periodInfo.icon}</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">Waktu Otomatis</span>
              <span className="font-black text-emerald-700 dark:text-emerald-300 capitalize drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] tracking-wide">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long' })}, {currentPeriod} jam {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')}
              </span>
            </div>
          </div>

          {/* Notification & Business Fund Bell Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu((prev) => !prev);
                setShowProfileMenu(false);
              }}
              className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifikasi Aktivitas Real-Time & Dana Bisnis"
            >
              <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Bell className="w-4 h-4 text-emerald-500" />
                    <span>Notifikasi Real-Time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {allNotifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        title="Bersihkan Notifikasi"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Bersihkan
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifMenu(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dana Bisnis Koperasi Summary Widget */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-3.5 text-white shadow-md mb-4">
                  <div className="flex items-center justify-between text-xs opacity-90 mb-1">
                    <span className="font-semibold flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" /> Kas Koperasi (Real-Time)
                    </span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Live</span>
                  </div>
                  <div className="text-xl font-black mb-2">
                    {formatRupiah(businessFund.netCash)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/20">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-white/20">
                        <ArrowDownRight className="w-3 h-3 text-emerald-200" />
                      </div>
                      <div>
                        <span className="block opacity-80 text-[9px]">Pemasukan</span>
                        <span className="font-bold">{formatRupiah(businessFund.totalIncome)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-white/20">
                        <ArrowUpRight className="w-3 h-3 text-rose-200" />
                      </div>
                      <div>
                        <span className="block opacity-80 text-[9px]">Pengeluaran</span>
                        <span className="font-bold">{formatRupiah(businessFund.totalExpense)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Activity List */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Notifikasi Terkini ({allNotifications.length})
                    </p>
                  </div>

                  {allNotifications.length === 0 ? (
                    <div className="py-6 text-center space-y-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-4">
                      <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2 opacity-60" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Tidak Ada Notifikasi
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Notifikasi baru akan muncul secara otomatis ketika transaksi jajan atau pengisian saldo dilakukan.
                      </p>
                    </div>
                  ) : (
                    allNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs transition-all cursor-pointer animate-in fade-in ${
                          notif.isRead
                            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800 opacity-70'
                            : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            notif.type === 'topup'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {notif.type === 'topup' ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <ShoppingBag className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px] flex items-center gap-1.5">
                              {notif.title}
                              {notif.isRead && <span className="text-[9px] font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md flex items-center gap-1"><Check className="w-3 h-3"/> Dibaca</span>}
                              {!notif.isRead && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatDateTime(notif.time).split(',')[1] || formatDateTime(notif.time)}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug font-medium">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>


          {/* Theme Customizer Palette Trigger */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Kustomisasi Tema Warna & Mode Gelap"
          >
            <Palette className="w-5 h-5" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="group p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer"
            title={`Ubah Ke ${themeMode === 'light' ? 'Mode Gelap' : 'Mode Terang'}`}
          >
            {themeMode === 'light' ? <Moon className="w-5 h-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" /> : <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />}
          </button>

          {/* Admin User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={
                  (user?.avatar_url && user.avatar_url.trim() !== '')
                    ? user.avatar_url
                    : defaultSantriAvatar
                }
                alt={user?.name || 'Admin'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                  {user?.name || 'Admin Koperasi'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {user?.role?.toUpperCase() || 'ADMIN'}
                </span>
              </div>
            </button>

            {/* Profile Menu Popup */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <div className="px-4 py-1.5 text-[11px] text-slate-400 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="capitalize">Role: {user?.role}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Profil Saya
                  </button>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar Sesi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </header>
  );
};
