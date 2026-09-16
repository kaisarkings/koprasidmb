import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import pesantrenLogo from '../../assets/images/sirajuddin_logo.jpg';
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Users,
  History,
  FileSpreadsheet,
  BarChart3,
  Settings,
  Building2,
  X,
  CreditCard,
  UserCheck,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { settings, uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';
  const { user, logout } = useAuth();

  const userRole = user?.role || 'admin';

  const allNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'administrator', 'guest'] },
    { label: 'Data Santri', path: '/santri', icon: Users, roles: ['admin', 'administrator', 'guest'] },
    { label: 'Transaksi (POS)', path: '/kasir', icon: ShoppingCart, badge: 'Kasir', roles: ['admin', 'administrator'] },
    { label: 'Isi Saldo Santri', path: '/topup', icon: Wallet, badge: 'TopUp', roles: ['admin', 'administrator'] },
    { label: 'Riwayat Transaksi', path: '/riwayat', icon: History, roles: ['admin', 'administrator'] },
    { label: 'Laporan PDF & Excel', path: '/laporan', icon: FileSpreadsheet, roles: ['admin', 'administrator'] },
    { label: 'Statistik & Analitik', path: '/statistik', icon: BarChart3, roles: ['admin', 'administrator'] },
    { label: 'Pengguna & Role', path: '/pengguna', icon: UserCheck, badge: 'Admin', roles: ['admin'] },
    { label: 'Pengaturan & DB', path: '/pengaturan', icon: Settings, roles: ['admin'] },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  const sidebarContent = (
    <div className={`flex flex-col h-full w-64 transition-colors ${isNeo ? "bg-white border-r-[4px] border-black font-mono shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] z-10 relative" : "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"}`}>
      {/* Brand Header */}
      <div className={`p-5 flex items-center justify-between ${isNeo ? "border-b-[4px] border-black bg-cyan-300" : "border-b border-slate-100 dark:border-slate-800"}`}>
        <div className="flex items-center gap-3">
          {settings.login_image_url && settings.login_image_url.trim() !== '' ? (
            <img
              src={settings.login_image_url}
              alt="Logo Koperasi"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = pesantrenLogo;
              }}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10 bg-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 font-bold text-xl">
              <Building2 className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className={`font-extrabold tracking-tight leading-tight ${isNeo ? "text-lg text-black uppercase drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]" : "text-base text-slate-900 dark:text-white"}`}>
              KOPERASI SANTRI
            </h1>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[140px]">
              {settings.pesantren_name}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          MENU UTAMA ({userRole.toUpperCase()})
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                isNeo ? `flex items-center justify-between px-3.5 py-2.5 rounded-none border-[3px] border-transparent font-bold text-sm transition-all ${isActive ? "bg-pink-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1" : "hover:bg-yellow-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 text-black"}` :
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/20 text-white dark:bg-slate-800 dark:text-emerald-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Logout & Footer */}
      <div className={`p-4 space-y-3 ${isNeo ? "border-t-[4px] border-black bg-white" : "border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"}`}>
        <button
          onClick={logout}
          className={isNeo ? "w-full flex items-center justify-center gap-2 px-3 py-2 border-[3px] border-black bg-rose-400 text-black text-xs font-black uppercase hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all" : "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"}
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Sistem Kasir v2.5</span>
            <span className="text-[10px]">Pondok Pesantren Active</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl z-10 animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
