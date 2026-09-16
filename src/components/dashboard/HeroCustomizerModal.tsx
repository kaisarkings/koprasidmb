import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  Save,
  Upload,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RotateCcw,
  Film,
  Check,
} from 'lucide-react';
import { HeroSlide } from '../../types';
import { useApp } from '../../context/AppContext';
import { DEFAULT_HERO_SLIDES } from '../../constants';

interface HeroCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset media choices for fast 1-click selection
const PRESET_MEDIA: { title: string; badge: string; type: 'video' | 'image'; url: string; subtitle: string }[] = [
  {
    title: 'Profil & Dokumentasi Video Pondok',
    subtitle: 'Kompilasi aktivitas santri dan kegiatan harian pesantren',
    badge: 'VIDEO PROFIL',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    title: 'Kompleks Asrama & Gedung SMP Sirajuddin',
    subtitle: 'Lingkungan belajar Islami & Asrama Santri Asrama Bawah & Atas',
    badge: 'FASILITAS PONDOK',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Kantin & Kasir Digital Terintegrasi RFID',
    subtitle: 'Kemudahan transaksi jajan santri cepat, aman, dan transparan',
    badge: 'KANTIN & TOKO',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1584697964400-2af6a2f6204c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Kajian Rutin & Pembentukan Karakter Mandiri',
    subtitle: 'Membentuk generasi santri mandiri, jujur, dan berakhlaqul karimah',
    badge: 'KEGIATAN SANTRI',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Otomatisasi Laporan & Transparansi Keuangan',
    subtitle: 'Ringkasan harian terkirim otomatis via Firebase & WhatsApp',
    badge: 'TRANSPARANSI DANA',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
];

export const HeroCustomizerModal: React.FC<HeroCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, showToast, refreshData } = useApp();
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    if (settings.hero_slides && settings.hero_slides.length > 0) {
      return JSON.parse(JSON.stringify(settings.hero_slides));
    }
    return JSON.parse(JSON.stringify(DEFAULT_HERO_SLIDES));
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  if (!isOpen) return null;

  const handleAddSlide = () => {
    if (slides.length >= 5) {
      showToast('warning', 'Batas Maksimal', 'Maksimal 5 media slide pada Hero Banner');
      return;
    }

    const isFirstVideo = slides.length === 0;
    const newSlide: HeroSlide = {
      id: `slide_${Date.now().toString(36)}`,
      type: isFirstVideo ? 'video' : 'image',
      url: isFirstVideo
        ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        : 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80',
      title: `Slide Hero ${slides.length + 1}`,
      subtitle: settings.pesantren_name,
      badge: isFirstVideo ? 'VIDEO PONDOK' : 'FOTO PONDOK',
      caption: '',
    };

    setSlides([...slides, newSlide]);
  };

  const handleUpdateSlide = (index: number, field: keyof HeroSlide, value: any) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      showToast('warning', 'Minimal 1 Slide', 'Minimal harus ada 1 slide hero banner');
      return;
    }
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === slides.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSlides(updated);
  };

  // Image compressor to prevent storage quota exceeded
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Gagal memproses gambar'));
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
    });
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('warning', 'Ukuran Terlalu Besar', 'Ukuran file gambar maksimal 15MB.');
      return;
    }

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file);
      handleUpdateSlide(index, 'url', compressedDataUrl);
      showToast('success', 'Foto Terunggah', 'Gambar berhasil dikompresi dan dimasukkan ke slide.');
    } catch (err: any) {
      showToast('error', 'Gagal Upload', err.message || 'Gagal memproses foto');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleApplyPreset = (index: number, preset: typeof PRESET_MEDIA[0]) => {
    const updated = [...slides];
    updated[index] = {
      ...updated[index],
      title: preset.title,
      subtitle: preset.subtitle,
      badge: preset.badge,
      type: preset.type,
      url: preset.url,
    };
    setSlides(updated);
    showToast('info', 'Preset Diterapkan', `Preset "${preset.title}" diterapkan ke slide ${index + 1}.`);
  };

  const handleResetToDefault = () => {
    setSlides(JSON.parse(JSON.stringify(DEFAULT_HERO_SLIDES)));
    showToast('info', 'Reset Bawaan', 'Slide dikembalikan ke konten bawaan pondok pesantren.');
  };

  const handleSave = async () => {
    // Validate slides
    for (let i = 0; i < slides.length; i++) {
      if (!slides[i].title.trim()) {
        showToast('warning', 'Judul Kosong', `Judul slide ke-${i + 1} tidak boleh kosong.`);
        return;
      }
      if (!slides[i].url.trim()) {
        showToast('warning', 'URL Media Kosong', `URL media pada slide ke-${i + 1} belum diisi.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateSettings({
        ...settings,
        hero_slides: slides,
      });
      showToast('success', 'Hero Berhasil Disimpan', 'Konfigurasi Hero Banner berhasil diperbarui.');
      await refreshData();
      onClose();
    } catch (err: any) {
      console.error('Save hero slides error:', err);
      showToast('error', 'Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan slide.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Kelola Hero Banner & Media Slide
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kustomisasi video & foto otomatis (Maksimal 5 slide, otomatis bergeser)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              title="Kembalikan ke slide foto/video bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60">
            <div>
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block">
                Daftar Slide Aktif: {slides.length} dari 5 Media
              </span>
              <span className="text-[11px] text-emerald-600/90 dark:text-emerald-400 font-medium">
                Slide 1 disarankan berupa Video MP4 Profil Pondok, slide 2-5 berupa Foto Kegiatan
              </span>
            </div>
            <button
              onClick={handleAddSlide}
              disabled={slides.length >= 5}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Slide</span>
            </button>
          </div>

          <div className="space-y-4">
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3.5 relative shadow-xs"
              >
                {/* Slide Top Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-700/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <select
                      value={slide.type}
                      onChange={(e) =>
                        handleUpdateSlide(idx, 'type', e.target.value as 'video' | 'image')
                      }
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="video">🎥 Video (MP4)</option>
                      <option value="image">🖼️ Foto / Gambar</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveSlide(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="Geser ke Atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveSlide(idx, 'down')}
                      disabled={idx === slides.length - 1}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="Geser ke Bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(idx)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 cursor-pointer"
                      title="Hapus Slide Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Preset Quick Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Preset:</span>
                  {PRESET_MEDIA.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleApplyPreset(idx, preset)}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-emerald-500 text-[10px] font-medium whitespace-nowrap cursor-pointer transition-colors"
                    >
                      {preset.badge}
                    </button>
                  ))}
                </div>

                {/* Slide Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Judul Slide *
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                      placeholder="Contoh: Profil Koperasi Santri"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      value={slide.badge || ''}
                      onChange={(e) => handleUpdateSlide(idx, 'badge', e.target.value)}
                      placeholder="Contoh: PROFIL VIDEO"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subjudul / Deskripsi Singkat
                    </label>
                    <input
                      type="text"
                      value={slide.subtitle || ''}
                      onChange={(e) => handleUpdateSlide(idx, 'subtitle', e.target.value)}
                      placeholder="Contoh: SMP Pondok Pesantren Sirajuddin"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      URL Media ({slide.type === 'video' ? 'Direct MP4 Video Link' : 'URL Foto / Unggah File'}) *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={slide.url}
                        onChange={(e) => handleUpdateSlide(idx, 'url', e.target.value)}
                        placeholder={
                          slide.type === 'video'
                            ? 'https://example.com/video.mp4'
                            : 'https://images.unsplash.com/photo-...'
                        }
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      {slide.type === 'image' && (
                        <label className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isCompressing ? 'Memproses...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isCompressing}
                            onChange={(e) => handleFileUpload(idx, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Media Preview Box */}
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black max-h-36 flex items-center justify-center relative">
                  {slide.type === 'video' ? (
                    slide.url && slide.url.trim() !== '' ? (
                      <video
                        src={slide.url}
                        className="w-full h-36 object-cover"
                        controls
                        muted
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="p-4 text-xs text-slate-400">Masukkan link file video MP4</span>
                    )
                  ) : (
                    <img
                      src={
                        slide.url && slide.url.trim() !== ''
                          ? slide.url
                          : 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt={slide.title || 'Preview'}
                      className="w-full h-36 object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                  )}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                    Preview: {slide.type.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/70">
          <div className="text-xs text-slate-500">
            Perubahan akan langsung terlihat di Dashboard secara otomatis
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isCompressing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
