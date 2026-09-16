import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { User, Mail, KeyRound, Image as ImageIcon, Camera } from 'lucide-react';
import defaultSantriAvatar from '../../assets/images/login_santri_avatar_1785105854262.jpg';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatar_url || '');
      setPassword('');
    }
  }, [isOpen, user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'File Tidak Valid', 'Silakan unggah file gambar (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setAvatarUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('error', 'Form Belum Lengkap', 'Nama dan Email wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        name,
        email,
        avatar_url: avatarUrl,
        password: password ? password : undefined,
      });
      showToast('success', 'Profil Diperbarui', 'Data profil Anda berhasil disimpan.');
      onClose();
    } catch (error: any) {
      showToast('error', 'Gagal Memperbarui Profil', error.message || 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil Saya">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-100 dark:border-emerald-900/50 mb-3 relative">
              <img
                src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : defaultSantriAvatar}
                alt={name || 'User'}
                onError={(e) => {
                  e.currentTarget.src = defaultSantriAvatar;
                }}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Klik foto untuk mengubah (Maks 1MB)
          </p>
        </div>

        <div className="hidden">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            URL Foto Profil
          </label>
          <div className="relative">
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://contoh.com/foto.jpg"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Lengkap *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email *
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Kata Sandi Baru (Opsional)
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-colors"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
