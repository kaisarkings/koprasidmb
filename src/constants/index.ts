import { Category, Student, Transaction, TopUp, AppSettings, AdminUser } from '../types';
import loginSantriAvatar from '../assets/images/login_santri_avatar_1785105854262.jpg';
import pesantrenLogo from '../assets/images/sirajuddin_logo.jpg';

export { loginSantriAvatar, pesantrenLogo };

export const DEFAULT_CLASSES = [
  'Kelas 1 SMP',
  'Kelas 2 SMP',
  'Kelas 3 SMP',
  'Kelas Aliyah',

];

export const DEFAULT_DORMITORIES = [
  'Asrama Bawah',
  'Asrama Atas',
];

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Makanan', code: 'FOOD', icon_name: 'Utensils', color: 'bg-emerald-500' },
  { id: 'cat-2', name: 'Minuman', code: 'DRINK', icon_name: 'Coffee', color: 'bg-blue-500' },
  { id: 'cat-3', name: 'Snack', code: 'SNACK', icon_name: 'Cookie', color: 'bg-amber-500' },
  { id: 'cat-4', name: 'ATK', code: 'ATK', icon_name: 'BookOpen', color: 'bg-purple-500' },
  { id: 'cat-5', name: 'Lainnya', code: 'MISC', icon_name: 'ShoppingBag', color: 'bg-gray-500' },
];

export const DEFAULT_HERO_SLIDES = [
  {
    id: 'slide-video-1',
    type: 'video' as const,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Profil Kegiatan & Pelayanan Koperasi Santri',
    subtitle: 'Pondok Pesantren Sirajuddin • Layanan Pembayaran Non-Tunai',
    badge: 'PROFIL VIDEO',
    caption: 'Video profil resmi koperasi santri dan pelayanan kasir digital',
  },
  {
    id: 'slide-img-1',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80',
    title: 'Kompleks Pondok Pesantren Sirajuddin',
    subtitle: 'Lingkungan Belajar Islami & Asrama Santri SMP Asrama Bawah & Atas',
    badge: 'FASILITAS PONDOK',
    caption: 'Suasana asri dan teratur kompleks pondok pesantren',
  },
  {
    id: 'slide-img-2',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1584697964400-2af6a2f6204c?auto=format&fit=crop&w=1200&q=80',
    title: 'Layanan Toko & Kasir Digital Koperasi',
    subtitle: 'Kemudahan Transaksi Jajan Santri dengan Kartu RFID Terintegrasi',
    badge: 'KANTIN & TOKO',
    caption: 'Pelayanan cepat dan transparan untuk kenyamanan santri',
  },
  {
    id: 'slide-img-3',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    title: 'Kajian Rutin & Pembentukan Karakter Mandiri',
    subtitle: 'Membentuk Generasi Santri Mandiri, Jujur, dan Berakhlaqul Karimah',
    badge: 'KEGIATAN SANTRI',
    caption: 'Pembinaan karakter dan kewirausahaan santri sejak dini',
  },
  {
    id: 'slide-img-4',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    title: 'Otomatisasi Laporan & Transparansi Keuangan',
    subtitle: 'Ringkasan Harian Terkirim Otomatis via Firebase Cloud Function',
    badge: 'TRANSPARANSI DANA',
    caption: 'Pengelolaan keuangan terpercaya dan dapat diakses realtime',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  pesantren_name: 'Pondok Pesantren Sirajuddin',
  koperasi_name: 'Koperasi Usaha Santri (KOPONTREN)',
  address: 'Jl. Pesantren No. 45, Jawa Barat',
  phone: '0812-3456-7890',
  email: 'koperasi@darussalam.ac.id',
  login_image_url: pesantrenLogo,
  treasurer_name: 'Ustadz Ahmad Hidayat, S.E.',
  head_pesantren_name: 'KH. Abdullah Syukri',
  enable_wa_notif: true,
  min_balance_alert: 10000,
  allow_debt: true,
  max_debt_limit: 50000,


  hero_slides: DEFAULT_HERO_SLIDES,
};

export { INITIAL_STUDENTS, INITIAL_TOPUPS, INITIAL_TRANSACTIONS } from './initialStudents';

export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@koperasi.local',
    name: 'Admin Utama',
    role: 'admin',
    status: 'aktif',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'usr-administrator-1',
    email: 'administrator@koperasi.local',
    name: 'Administrator',
    role: 'administrator',
    status: 'aktif',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];
