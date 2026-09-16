import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../../types';
import { DEFAULT_CLASSES, DEFAULT_DORMITORIES } from '../../constants';
import { Modal } from '../common/Modal';
import { generateNIS } from '../../utils/formatters';
import { StudentAvatar } from '../common/StudentAvatar';
import { compressAndReadFileAsDataURL } from '../../utils/fileHelpers';
import { User, CreditCard, Phone, Home, BookOpen, CheckCircle, Calendar, Upload, Camera, Trash2, RefreshCw } from 'lucide-react';

interface SantriFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => Promise<void>;
  studentToEdit?: Student | null;
}

export const SantriFormModal: React.FC<SantriFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
}) => {
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [className, setClassName] = useState(DEFAULT_CLASSES[0]);
  const [dormitory, setDormitory] = useState(DEFAULT_DORMITORIES[0]);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [joinedDate, setJoinedDate] = useState(new Date().toISOString().slice(0, 10));
  const [avatarUrl, setAvatarUrl] = useState('');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setNis(studentToEdit.nis);
      setClassName(studentToEdit.class_name);
      setDormitory(studentToEdit.dormitory);
      setParentName(studentToEdit.parent_name);
      setParentPhone(studentToEdit.parent_phone);
      setStatus(studentToEdit.status);
      setJoinedDate(studentToEdit.joined_date ? studentToEdit.joined_date.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setAvatarUrl(studentToEdit.avatar_url || '');
      setInitialBalance(studentToEdit.balance || 0);
    } else {
      setName('');
      setNis(generateNIS());
      setClassName(DEFAULT_CLASSES[0]);
      setDormitory(DEFAULT_DORMITORIES[0]);
      setParentName('');
      setParentPhone('');
      setStatus('aktif');
      setJoinedDate(new Date().toISOString().slice(0, 10));
      setAvatarUrl(''); // Empty default -> uses animated character automatically
      setInitialBalance(0);
    }
  }, [studentToEdit, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const dataUrl = await compressAndReadFileAsDataURL(file, 400);
      setAvatarUrl(dataUrl);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses gambar');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !parentName.trim() || !parentPhone.trim()) {
      alert('Mohon lengkapi semua field wajib!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: studentToEdit?.id,
        name: name.trim(),
        nis: nis.trim() || generateNIS(),
        class_name: className,
        dormitory,
        parent_name: parentName.trim(),
        parent_phone: parentPhone.trim(),
        status,
        joined_date: joinedDate,
        avatar_url: avatarUrl,
        balance: initialBalance,
        qr_code_data: nis.trim() || generateNIS(),
      });
      onClose();
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan data santri');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Edit Data Santri' : 'Tambah Santri Baru'}
      subtitle="Isi formulir biodata santri dan wali santri secara lengkap"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Foto / Avatar Santri Selection & File Upload */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
            Foto Profil Santri (File / Karakter Animasi)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <StudentAvatar
                src={avatarUrl}
                name={name || 'Santri'}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-sm"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-transform active:scale-95"
                title="Ganti Foto (Upload File)"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 space-y-2 w-full text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isUploadingPhoto ? 'Memproses...' : 'Upload Foto File (HP/PC)'}
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    Pakai Karakter Animasi
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-400 leading-snug">
                {avatarUrl
                  ? 'Foto dari file lokal tersimpan dengan aman.'
                  : 'Santri putra otomatis menggunakan karakter animasi (bawaan). Anda dapat mengunggah foto asli santri dari HP atau Komputer.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nama Santri */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Santri *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ahmad Fauzi"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* NIS */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Nomor Induk Santri (NIS) *
              </label>
              <button
                type="button"
                onClick={() => setNis(generateNIS())}
                className="text-[10px] text-emerald-600 hover:underline font-bold"
              >
                Auto Generate
              </button>
            </div>
            <input
              type="text"
              required
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="SNT-261001"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Kelas */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kelas *
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none"
            >
              {DEFAULT_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Asrama */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Asrama *
            </label>
            <select
              value={dormitory}
              onChange={(e) => setDormitory(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none"
            >
              {DEFAULT_DORMITORIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Orang Tua */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Orang Tua / Wali *
            </label>
            <input
              type="text"
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Contoh: H. Mansur Fauzi"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* WhatsApp Orang Tua */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              No. WhatsApp Orang Tua *
            </label>
            <input
              type="text"
              required
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Tanggal Masuk */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Masuk Pondok
            </label>
            <input
              type="date"
              value={joinedDate}
              onChange={(e) => setJoinedDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status Santri
            </label>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="aktif"
                  checked={status === 'aktif'}
                  onChange={() => setStatus('aktif')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Aktif</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="nonaktif"
                  checked={status === 'nonaktif'}
                  onChange={() => setStatus('nonaktif')}
                  className="text-slate-600"
                />
                <span className="font-semibold text-slate-500">Non-Aktif</span>
              </label>
            </div>
          </div>
        </div>

        {/* Set Initial Balance if New */}
        {!studentToEdit && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <label className="block font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              Setoran Saldo Awal (Rp)
            </label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-md shadow-emerald-500/20"
          >
            {isSubmitting ? 'Memproses...' : 'Simpan Data Santri'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
