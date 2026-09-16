import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Image as ImageIcon,
  Building2,
  Sparkles,
  Settings2,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from 'lucide-react';
import { HeroSlide } from '../../types';
import { useApp } from '../../context/AppContext';
import { HeroCustomizerModal } from './HeroCustomizerModal';


const SLIDE_INTERVAL_MS = 6500;

export const HeroCarousel: React.FC = () => {
  const { settings } = useApp();
  const previewColor = '#10b981';
  

  const slides: HeroSlide[] =
    settings.hero_slides && settings.hero_slides.length > 0
      ? settings.hero_slides.slice(0, 5)
      : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const currentSlide = slides[currentIndex] || slides[0];

  // Reset video error when slide changes
  useEffect(() => {
    setVideoError(false);
    setProgressKey((prev) => prev + 1);
  }, [currentIndex, currentSlide?.url]);

  // Auto-slide timer: automatically shifts every SLIDE_INTERVAL_MS
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, currentIndex]);

  // Video autoplay sync
  useEffect(() => {
    if (currentSlide?.type === 'video' && videoRef.current && !videoError) {
      try {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlayingVideo(true))
            .catch(() => setIsPlayingVideo(false));
        }
      } catch (err) {
        setIsPlayingVideo(false);
      }
    }
  }, [currentIndex, currentSlide?.type, currentSlide?.url, videoError]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const toggleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlayingVideo) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    } else {
      videoRef.current.play();
      setIsPlayingVideo(true);
    }
  };

  const toggleVideoMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  if (!currentSlide) return null;

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 text-white group transition-all duration-300 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Animated Progress Bar for Auto-Slide */}
      {slides.length > 1 && !isPaused && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
          <motion.div
            key={progressKey}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: SLIDE_INTERVAL_MS / 1000, ease: 'linear' }}
            className="h-full bg-emerald-400"
            style={{ backgroundColor: previewColor }}
          />
        </div>
      )}

      {/* Aspect Ratio Container */}
      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[360px] overflow-hidden flex items-center justify-center">
        {/* Animated Slide Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id || currentIndex}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {currentSlide.type === 'video' && !videoError ? (
              <div className="relative w-full h-full bg-black">
                {currentSlide.url && currentSlide.url.trim() !== '' ? (
                  <video
                    ref={videoRef}
                    src={currentSlide.url}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    onEnded={handleNext}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setVideoError(true);
                      setIsPlayingVideo(false);
                    }}
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80"
                    alt={currentSlide.title || 'Slide Hero'}
                    className="w-full h-full object-cover object-center"
                  />
                )}
              </div>
            ) : (
              <img
                src={
                  currentSlide.url && currentSlide.url.trim() !== ''
                    ? currentSlide.url
                    : 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80'
                }
                alt={currentSlide.title || 'Slide Hero'}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80';
                }}
              />
            )}

            {/* Dark Gradient Overlay for high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-900/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/30 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="absolute inset-0 p-5 sm:p-7 md:p-8 flex flex-col justify-between z-10 pointer-events-none">
          {/* Top Bar inside Banner */}
          <div className="flex items-center justify-between gap-2 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider border backdrop-blur-md uppercase text-white shadow-sm"
                style={{
                  backgroundColor: `${previewColor}33`,
                  borderColor: `${previewColor}66`,
                }}
              >
                {currentSlide.type === 'video' ? (
                  <Video className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />
                )}
                <span>{currentSlide.badge || (currentSlide.type === 'video' ? 'VIDEO' : 'FOTO')}</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/70 text-slate-200 text-[11px] font-semibold border border-slate-700/60 backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{settings.pesantren_name}</span>
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {currentSlide.type === 'video' && !videoError && (
                <>
                  <button
                    onClick={toggleVideoPlay}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white backdrop-blur-md transition-all cursor-pointer"
                    title={isPlayingVideo ? 'Pause Video' : 'Play Video'}
                  >
                    {isPlayingVideo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={toggleVideoMute}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white backdrop-blur-md transition-all cursor-pointer"
                    title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}

              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-white font-extrabold text-xs flex items-center gap-1.5 border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{ backgroundColor: previewColor }}
                title="Kustomisasi Foto / Video Hero"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Custom Hero</span>
              </button>
            </div>
          </div>

          {/* Bottom Title & Subtitle */}
          <div className="max-w-2xl space-y-2 pointer-events-auto">
            <motion.div
              key={`text-${currentIndex}`}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1 drop-shadow-sm max-w-xl line-clamp-2">
                  {currentSlide.subtitle}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Left / Right Arrow Navigation */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/50 hover:bg-slate-900/90 border border-white/15 text-white backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer"
              aria-label="Slide Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/50 hover:bg-slate-900/90 border border-white/15 text-white backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer"
              aria-label="Slide Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Pagination Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
            {slides.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 shadow-lg'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                style={
                  idx === currentIndex
                    ? { backgroundColor: previewColor }
                    : undefined
                }
                aria-label={`Ke slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Customizer Modal */}
      <HeroCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </div>
  );
};
