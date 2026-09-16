import re

with open('src/pages/LoginPage.tsx', 'r') as f:
    content = f.read()

# Make it neo-brutalism and add guest login

new_imports = """
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Building2, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import defaultSantriAvatar from '../assets/images/login_santri_avatar_1785105854262.jpg';
import pesantrenLogo from '../assets/images/sirajuddin_logo.jpg';
"""

# Find export const LoginPage = ...
new_component = """
export const LoginPage: React.FC = () => {
  const { login, loginAsGuest, isAuthenticated } = useAuth();
  const { showToast, settings } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('success', 'Login Berhasil', res.message);
        navigate('/', { replace: true });
      } else {
        showToast('error', 'Login Gagal', res.message);
      }
    } catch (e: any) {
      showToast('error', 'Error Login', e.message || 'Terjadi kesalahan saat login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    try {
      const res = await loginAsGuest();
      if (res.success) {
        showToast('success', 'Berhasil', res.message);
        navigate('/', { replace: true });
      }
    } catch (e: any) {
      showToast('error', 'Gagal', 'Tidak dapat masuk sebagai tamu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginImage = settings.login_image_url || defaultSantriAvatar;

  return (
    <div className="min-h-screen bg-amber-300 dark:bg-amber-900 flex flex-col justify-center items-center p-4 transition-colors font-mono relative overflow-hidden">
      {/* Decorative Neo-Brutalism elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-cyan-400 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-0 animate-bounce" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-400 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-12 z-0" />
      <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-lime-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-6 z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10 rounded-2xl"
      >
        {/* Brand Logo & Custom Mascot/Logo Image */}
        <div className="flex flex-col items-center text-center mb-8 relative">
          <div className="absolute -top-12 -right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 border-2 border-black rotate-12 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            MASUK DULU BRO!
          </div>
          <div className="relative mb-4">
            <img
              src={loginImage}
              alt="Logo Koperasi"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = pesantrenLogo;
              }}
              className="w-24 h-24 object-cover border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-full"
            />
          </div>
          <h1 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter">
            {settings.koperasi_name || 'KOPERASI SANTRI'}
          </h1>
          <p className="text-sm text-black dark:text-gray-300 font-bold bg-pink-300 dark:bg-pink-600 px-2 mt-1 border-2 border-black rotate-[-1deg]">
            {settings.pesantren_name}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">
              Email Admin
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@koperasi.local"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border-4 border-black text-black dark:text-white font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl"
              />
              <Mail className="w-5 h-5 absolute left-4 top-3.5 text-black dark:text-gray-300 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-2 uppercase">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-700 border-4 border-black text-black dark:text-white font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl"
              />
              <Lock className="w-5 h-5 absolute left-4 top-3.5 text-black dark:text-gray-300 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-3.5 text-black dark:text-gray-300 hover:scale-110 transition-transform"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-4 bg-cyan-400 hover:bg-cyan-300 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-black font-black text-base uppercase flex items-center justify-center gap-2 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer rounded-xl"
          >
            {isSubmitting ? (
              <span>OTW BOSQU...</span>
            ) : (
              <>
                <span>Masuk Admin</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-4 border-black border-dashed text-center">
          <p className="text-sm font-bold mb-4 uppercase">Bukan Admin?</p>
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isSubmitting}
            className="w-full py-3 bg-lime-400 hover:bg-lime-300 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-black font-black text-sm uppercase flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer rounded-xl"
          >
            <UserCheck className="w-5 h-5" />
            Masuk Sebagai Wali Santri
          </button>
        </div>
      </motion.div>

      <p className="text-sm font-bold text-black mt-10 bg-white border-2 border-black px-4 py-2 rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 rounded-xl">
        © {new Date().getFullYear()} {settings.pesantren_name}
      </p>
    </div>
  );
};
"""

content = new_imports + new_component

with open('src/pages/LoginPage.tsx', 'w') as f:
    f.write(content)
