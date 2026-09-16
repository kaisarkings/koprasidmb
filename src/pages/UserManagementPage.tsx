import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';
import { AdminUser, UserRole } from '../types';
import { Modal } from '../components/common/Modal';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  KeyRound,
  Mail,
  User,
  Shield,
  BookOpen,
  Wallet,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser, users, addUser, updateUserStatus, deleteUser } = useAuth();
  const { showToast , uiStyle} = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('administrator');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUser | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setPassword('Santri123!');
    setRole('administrator');
    setStatus('aktif');
    setIsModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('error', 'Form Belum Lengkap', 'Nama dan Email wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      await addUser({
        name,
        email,
        password,
        role,
        status,
      });
      showToast('success', 'Pengguna Ditambahkan', `Akun ${name} dengan role ${role.toUpperCase()} berhasil dibuat!`);
      setIsModalOpen(false);
    } catch (error: any) {
      showToast('error', 'Gagal Menambah Pengguna', error.message || 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser: AdminUser) => {
    const newStatus = targetUser.status === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await updateUserStatus(targetUser.id, newStatus);
      showToast('info', 'Status Diubah', `Status akun ${targetUser.name} diubah menjadi ${newStatus.toUpperCase()}`);
    } catch (e: any) {
      showToast('error', 'Gagal Mengubah Status', e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    try {
      await deleteUser(deleteConfirmUser.id);
      showToast('success', 'Pengguna Dihapus', `Akun ${deleteConfirmUser.name} telah dihapus.`);
      setDeleteConfirmUser(null);
    } catch (e: any) {
      showToast('error', 'Gagal Menghapus', e.message);
    }
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Shield className="w-3 h-3" />
            Admin System
          </span>
        );
      case 'administrator':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <UserCheck className="w-3 h-3" />
            Administrator
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {userRole}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Manajemen Pengguna & Hak Akses
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola akun administrator dan admin koperasi santri
              </p>
            </div>
          </div>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-500/20 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        )}
      </div>

      {/* Role Explanations Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40">
          <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-300 text-xs mb-1">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Role Admin</span>
          </div>
          <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
            Akses penuh ke seluruh sistem: Kelola Santri, Transaksi, Saldo, Laporan, Pengguna & Pengaturan DB.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
          <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300 text-xs mb-1">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Role Administrator</span>
          </div>
          <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
            Akses operasional: Transaksi, Saldo, Monitoring & Laporan. Tanpa akses Pengaturan/Pengguna.
          </p>
        </div>


      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau email pengguna..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-medium text-slate-500 shrink-0">Filter Role:</span>
          {['all', 'admin', 'administrator'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? 'Semua Role' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Pengguna</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role Hak Akses</th>
                <th className="py-3.5 px-4">Status Akun</th>
                <th className="py-3.5 px-4">Tanggal Dibuat</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden font-bold text-slate-600 dark:text-slate-300">
                            {u.avatar_url && u.avatar_url.trim() !== '' ? (
                              <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>

                      <td className="py-3.5 px-4">
                        {u.status === 'aktif' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                            <XCircle className="w-3 h-3" /> Nonaktif
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {currentUser?.role === 'admin' && !isCurrent && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(u)}
                                title={u.status === 'aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                                  u.status === 'aktif'
                                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                                }`}
                              >
                                {u.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>

                              <button
                                onClick={() => setDeleteConfirmUser(u)}
                                title="Hapus Pengguna"
                                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isCurrent && (
                            <span className="text-[11px] font-medium text-slate-400 italic">
                              Sesi Aktif
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Pengguna / Pengurus Baru"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Pengguna *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ustadz M. Syarif, M.Pd"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Akses *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="administrator@koperasi.id"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi *
            </label>
            <div className="relative">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Santri123!"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role / Hak Akses *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="administrator">Administrator</option>
                <option value="admin">Admin (Akses Penuh)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Akun
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Pengguna yang dibuat dapat langsung digunakan untuk masuk aplikasi tanpa membuka dashboard Supabase.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
            </button>
          </div>
        </form>
      </Modal>

      

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmUser)}
        onClose={() => setDeleteConfirmUser(null)}
        title="Hapus Pengguna"
        maxWidth="md"
      >
        {deleteConfirmUser && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50 flex gap-3 text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold mb-1">Peringatan Penghapusan</p>
                <p>
                  Apakah Anda yakin ingin menghapus akun pengguna{' '}
                  <strong className="text-rose-900 dark:text-rose-200">{deleteConfirmUser.name}</strong>?
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-colors"
              >
                Ya, Hapus Pengguna
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

